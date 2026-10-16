"""Offline invariants and artifact checks; these do not establish webcam accuracy."""
from dataclasses import replace
from datetime import datetime, timezone, timedelta
import importlib.util
import json
from pathlib import Path
import sys
from types import SimpleNamespace
import numpy as np
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from columbia_features import extract, feature_vector, FEATURE_NAMES
from config import Config, REGIONS, COLUMBIA_DIR, safe_id
from interaction import Smoother, BlinkDetector, SelectionMachine, eye_openness
from model_loading import load_model, predict
from personalization import validate_samples, train_and_compare, SAMPLE_COLUMNS
from events import EventLog


def landmarks():
    points = [SimpleNamespace(x=0.5, y=0.5) for _ in range(478)]
    for iris, corners, lids, ring, center in [(468, (33, 133), (159, 145), range(469, 473), 0.3),
                                           (473, (362, 263), (386, 374), range(474, 478), 0.7)]:
        points[corners[0]] = SimpleNamespace(x=center - 0.05, y=0.5)
        points[corners[1]] = SimpleNamespace(x=center + 0.05, y=0.5)
        points[lids[0]] = SimpleNamespace(x=center, y=0.48)
        points[lids[1]] = SimpleNamespace(x=center, y=0.52)
        points[iris] = SimpleNamespace(x=center, y=0.5)
        for index, offset in zip(ring, [(0.01, 0), (0, 0.01), (-0.01, 0), (0, -0.01)]):
            points[index] = SimpleNamespace(x=center + offset[0], y=0.5 + offset[1])
    return points


def test_geometry_order_and_exact_values():
    values = extract(landmarks(), 1000, 500)
    assert list(values) == FEATURE_NAMES
    assert len(feature_vector(landmarks(), 1000, 500)) == 10
    assert np.isfinite(list(values.values())).all()
    assert list(values.values()) == pytest.approx([0, 0, 0.2, 0.075, 0, 0, 0.2, 0.075, 0.5, 0.5])
    assert eye_openness(landmarks(), 1000, 500) == pytest.approx([0.2, 0.2])


@pytest.mark.parametrize('bad', ['missing', 'nan', 'degenerate', 'closed'])
def test_invalid_features(bad):
    points = landmarks()
    if bad == 'missing':
        points.pop()
    elif bad == 'nan':
        points[468].x = float('nan')
    elif bad == 'degenerate':
        points[133] = points[33]
    else:
        points[145] = points[159]
    with pytest.raises(ValueError):
        extract(points, 1000, 500)


@pytest.mark.skip(reason="Legacy Columbia dataset artifacts are no longer available")
def test_public_extractor_delegates_without_formula_drift():
    sys.path.insert(0, str(COLUMBIA_DIR))
    try:
        spec = importlib.util.spec_from_file_location('public_extraction', COLUMBIA_DIR / 'extract_features.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        assert module.eye_features is sys.modules['columbia_features'].eye_features
        assert module.extract(landmarks(), 1000, 500, True) == extract(landmarks(), 1000, 500)
        assert len(module.extract(landmarks(), 1000, 500)) == 8
    finally:
        sys.path.remove(str(COLUMBIA_DIR))


@pytest.mark.skip(reason="Legacy Columbia dataset artifacts are no longer available")
def test_general_model_reproduces_saved_predictions_and_five_classes():
    config = Config()
    model = load_model(config.general_model, config.general_metadata)
    saved = pd.read_csv(COLUMBIA_DIR / 'svm_results_improved' / 'test_predictions.csv')
    predictions = model.predict(saved[FEATURE_NAMES])
    assert (predictions == saved.predicted_region).all()
    assert set(predictions) == set(REGIONS)
    assert predict(model, dict(saved[FEATURE_NAMES].iloc[0])) == predictions[0]


def test_model_schema_mismatch_fails(tmp_path):
    config = Config()
    meta = json.loads(config.general_metadata.read_text())
    meta['features'] = list(reversed(FEATURE_NAMES))
    path = tmp_path / 'wrong.json'
    path.write_text(json.dumps(meta))
    with pytest.raises(ValueError, match='order'):
        load_model(config.general_model, path)


def sample_data(config):
    rows = []
    rng = np.random.default_rng(3)
    start = datetime(2026, 1, 1, tzinfo=timezone.utc)
    for phase, trials in [('calibration', config.calibration_trials), ('independent_test', config.test_trials)]:
        for trial in range(1, trials + 1):
            for index, region in enumerate(REGIONS):
                for sample in range(config.minimum_samples_per_trial):
                    rows.append({'user_id': 'SYNTHETIC', 'session_id': 'OFFLINE_TEST', 'phase': phase,
                                 'trial_id': f'{phase}_{region}_{trial}',
                                 'timestamp': (start + timedelta(milliseconds=100 * len(rows))).isoformat(),
                                 'true_region': region, 'tracking_valid': True,
                                 **dict(zip(FEATURE_NAMES, rng.normal(index, 0.03, 10)))})
    return pd.DataFrame(rows, columns=SAMPLE_COLUMNS)


def test_complete_calibration_csv(tmp_path):
    config = Config()
    csv = tmp_path / 'samples.csv'
    sample_data(config).to_csv(csv, index=False)
    calibration, test = validate_samples(pd.read_csv(csv), config)
    assert set(calibration.true_region) == set(test.true_region) == set(REGIONS)
    assert calibration.trial_id.nunique() == test.trial_id.nunique() == 15
    assert not set(calibration.trial_id) & set(test.trial_id)


@pytest.mark.parametrize('problem', ['missing_trial', 'test_in_calibration', 'nan', 'invalid_tracking', 'duplicate_timestamp'])
def test_bad_calibration_rejected(problem):
    config = Config()
    df = sample_data(config)
    if problem == 'missing_trial':
        df = df[df.trial_id != 'calibration_LEFT_1']
    elif problem == 'test_in_calibration':
        df.loc[df.phase == 'independent_test', 'phase'] = 'calibration'
    elif problem == 'nan':
        df.loc[0, FEATURE_NAMES[0]] = np.nan
    elif problem == 'invalid_tracking':
        df.loc[0, 'tracking_valid'] = False
    else:
        df.loc[1, 'timestamp'] = df.loc[0, 'timestamp']
    with pytest.raises(ValueError):
        validate_samples(df, config)


def test_training_uses_only_calibration_and_shared_test(tmp_path, monkeypatch):
    from sklearn.pipeline import Pipeline
    config = replace(Config(), model_dir=tmp_path / 'models', results_dir=tmp_path / 'results')
    df = sample_data(config)
    csv = tmp_path / 'samples.csv'
    df.to_csv(csv, index=False)
    fitted_indices = []
    original = Pipeline.fit

    def spy(self, X, y, **kwargs):
        fitted_indices.append(set(X.index))
        assert set(X.index) <= set(df.index[df.phase == 'calibration'])
        return original(self, X, y, **kwargs)

    monkeypatch.setattr(Pipeline, 'fit', spy)
    comparison, output = train_and_compare(csv, config)
    assert len(fitted_indices) == 2
    assert len(fitted_indices[0]) == 50
    assert len(fitted_indices[1]) == 150
    assert set(comparison.condition) == {'no_calibration', 'short', 'full'}
    predicted = pd.read_csv(output / 'independent_predictions.csv')
    assert len(predicted) == 150
    assert (predicted.phase == 'independent_test').all()
    assert (output / 'calibration_comparison.csv').is_file()
    with pytest.raises(FileExistsError):
        train_and_compare(csv, config)


def arm(machine, region='CENTER', start=0):
    assert machine.update(region, start) is None
    for t in np.arange(start + 0.1, start + 1.11, 0.1):
        assert machine.update(region, float(t)) is None
    assert machine.state == 'ARMED'


def test_smoothing_requires_window_and_majority():
    smoother = Smoother(5)
    assert [smoother.update(r) for r in ['RIGHT', 'RIGHT', 'CENTER', 'RIGHT', 'RIGHT']] == [None, None, None, None, 'RIGHT']
    assert smoother.update(None) is None
    assert not smoother.history


def test_dwell_never_selects_without_blink():
    machine = SelectionMachine(Config())
    arm(machine)
    for now in np.arange(1.2, 3, 0.1):
        assert machine.update('CENTER', float(now)) is None


def test_raw_noise_does_not_reset_smoothed_dwell_but_cancels_armed_target():
    machine = SelectionMachine(Config())
    smoother = Smoother(5)
    for index, raw in enumerate(['CENTER'] * 8 + ['LEFT'] + ['CENTER'] * 7):
        stable = smoother.update(raw)
        if machine.cancel_changed_armed_gaze(raw):
            smoother.reset()
            stable = None
        machine.update(stable, index * 0.1)
    assert machine.state == 'ARMED'
    assert machine.target == 'CENTER'
    assert machine.cancel_changed_armed_gaze('LEFT')
    assert machine.state == 'IDLE'


def test_posture_hint_matches_mirrored_preview_and_gate():
    from live_runtime import posture_hint, face_in_position
    points = landmarks()
    points[4].x, points[4].y = 0.44, 0.50
    anchor, tolerance = [0.49, 0.60], (0.04, 0.07)
    assert not face_in_position(points, anchor, tolerance)
    assert posture_hint(points, anchor, tolerance) == 'Move face left and down in preview'
    points[4].x, points[4].y = anchor
    assert posture_hint(points, anchor, tolerance) == 'Face steady'


def test_blink_before_arming_cannot_select():
    machine = SelectionMachine(Config())
    machine.update('CENTER', 0)
    machine.update(None, 0.1, eyes_closed=True)
    machine.update(None, 0.2, eyes_closed=True)
    assert machine.update('CENTER', 0.3, blink_duration=0.22) is None
    assert machine.state == 'IDLE'


def test_deliberate_blink_and_cooldown():
    machine = SelectionMachine(Config())
    arm(machine)
    for now in [1.2, 1.3, 1.4]:
        machine.update(None, now, eyes_closed=True)
    selection = machine.update('CENTER', 1.5, blink_duration=0.3)
    assert selection['region'] == 'CENTER'
    assert selection['transitions'] == ['IDLE', 'TARGET_FOUND', 'DWELLING', 'ARMED', 'WAITING_FOR_BLINK', 'CONFIRMED', 'SELECTED']
    for now in [1.6, 1.7, 1.8, 1.9, 2.0]:
        assert machine.update('CENTER', now, blink_duration=0.3) is None
        assert machine.state == 'IDLE'


@pytest.mark.parametrize('duration', [0.1, 0.8])
def test_short_and_long_blinks_do_not_confirm(duration):
    config = replace(Config(), max_frame_gap=2)
    machine = SelectionMachine(config)
    arm(machine)
    machine.update(None, 1.2, eyes_closed=True)
    assert machine.update('CENTER', 1.2 + duration, blink_duration=duration) is None


@pytest.mark.parametrize('failure', ['tracking_loss', 'movement', 'reopening_movement', 'frame_gap', 'timeout'])
def test_armed_resets_safely(failure):
    machine = SelectionMachine(Config())
    arm(machine)
    if failure == 'tracking_loss':
        machine.update(None, 1.2, tracking_valid=False)
    elif failure == 'movement':
        machine.update('LEFT', 1.2)
    elif failure == 'reopening_movement':
        machine.update(None, 1.2, eyes_closed=True)
        machine.update(None, 1.3, eyes_closed=True)
        assert machine.update('LEFT', 1.4, blink_duration=0.22) is None
    elif failure == 'frame_gap':
        machine.update('CENTER', 2)
    else:
        for now in np.arange(1.2, 4.3, 0.1):
            machine.update('CENTER', float(now))
    assert machine.armed_at is None


def test_blink_detector_independent_timing():
    blink = BlinkDetector(Config())
    assert blink.update([0.1, 0.1], 1) == (True, None)
    assert blink.update([0.2, 0.2], 1.4)[1] == pytest.approx(0.4)
    blink.update([0.1, 0.1], 2)
    blink.reset()
    assert blink.update([0.2, 0.2], 2.4) == (False, None)


def test_success_is_separate_from_correctness(tmp_path):
    log = EventLog(tmp_path / 'events', 'U001', 'S001', 'full')
    log.total_frames, log.valid_frames = 10, 8
    event = log.selection('A1', 'BOOK', 'CENTER', 1000, 1500, False)
    assert event['interaction_success'] is True
    assert event['answer_correct'] is False
    summary = log.close('aborted')
    assert summary['successful_gaze_selections'] == 1
    assert summary['incorrect_answers'] == 1
    assert summary['false_selections'] is None
    assert summary['tracking_valid_ratio'] == 0.8
    assert json.loads((tmp_path / 'events' / 'component03_events.jsonl').read_text())['component'] == 'gaze-interaction'


@pytest.mark.parametrize('value', ['../user', '..', 'C:\\user', 'a/b', ''])
def test_identifiers_cannot_escape_project(value):
    with pytest.raises(ValueError):
        safe_id(value)


@pytest.mark.parametrize('abort', [False, True])
def test_actual_collector_generates_separate_phases_and_rejects_abort(tmp_path, monkeypatch, abort):
    import live_calibration
    import target_collection
    from presentation_fakes import SimulatedDisplay
    monkeypatch.setattr(target_collection, 'TargetDisplay', SimulatedDisplay)
    import model_loading
    monkeypatch.setattr(model_loading, 'load_model', lambda *args: pytest.fail('Collection loaded gaze model'))
    import itertools
    config = replace(Config(), data_dir=tmp_path / 'data', calibration_trials=2, test_trials=1,
                     settling_time=0.05, collection_duration=0.3, sampling_rate=10,
                     minimum_samples_per_trial=1, tracking_validation_duration=0.1)
    times = itertools.count(0, 0.05)
    features = extract(landmarks(), 1000, 500)

    from image_fakes import synthetic_frame

    class FakeCapture:
        def __init__(self, config):
            self.last_landmarks = landmarks()
            self.face_anchor = None

        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

        def read(self, now):
            return synthetic_frame(), features, [0.2, 0.2], 'OK'

    monkeypatch.setattr(live_calibration, 'LiveCapture', FakeCapture)
    monkeypatch.setattr(live_calibration.time, 'monotonic', lambda: next(times))
    monkeypatch.setattr(live_calibration, 'open_window', lambda *args: None)
    monkeypatch.setattr(live_calibration, 'wait_for_recording_start', lambda *args: None)
    monkeypatch.setattr(live_calibration.cv2, 'imshow', lambda *args: None)
    monkeypatch.setattr(live_calibration.cv2, 'getWindowProperty', lambda *args: 1)
    monkeypatch.setattr(live_calibration.cv2, 'waitKey', lambda *args: ord('q') if abort else -1)
    if abort:
        with pytest.raises(InterruptedError):
            live_calibration.collect('U001', 'S001', config, adult_pilot_confirmed=True)
        with pytest.raises(ValueError, match='not completed'):
            train_and_compare(config.data_dir / 'U001' / 'S001' / 'samples.csv', config)
    else:
        path = live_calibration.collect('U001', 'S001', config, adult_pilot_confirmed=True)
        calibration, test = validate_samples(pd.read_csv(path), config)
        assert calibration.trial_id.nunique() == 10
        assert test.trial_id.nunique() == 5
        assert json.loads((path.parent / 'session.json').read_text())['status'] == 'complete'


def test_relocated_paths_ignore_working_directory(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    model = load_model(Config().general_model, Config().general_metadata)
    assert model.n_features_in_ == 10


@pytest.mark.skip(reason="Legacy Columbia dataset artifacts are no longer available")
def test_copied_general_artifacts_match_original():
    import hashlib
    config = Config()
    for path, original in [(config.general_model, COLUMBIA_DIR / 'svm_results_improved' / 'gaze_rbf_svm_columbia.joblib'),
                           (config.general_metadata, COLUMBIA_DIR / 'svm_results_improved' / 'results.json'),
                           (config.landmark_model, COLUMBIA_DIR / 'face_landmarker.task')]:
        assert hashlib.sha256(path.read_bytes()).digest() == hashlib.sha256(original.read_bytes()).digest()


def test_face_positioning_rejects_missing_or_moved_face():
    from live_runtime import face_in_position, face_position, draw_position_preview
    points = landmarks()
    assert face_in_position(points)
    anchor = face_position(points).copy()
    points[4].x = 0.8
    assert not face_in_position(points, anchor)
    assert not face_in_position(None, anchor)
    assert draw_position_preview(None, points, False, anchor).shape == (540, 960, 3)


def test_preview_mirroring_does_not_mutate_inference_frame():
    from live_runtime import draw_position_preview
    frame = np.arange(60 * 100 * 3, dtype=np.uint8).reshape(60, 100, 3)
    original = frame.copy()
    draw_position_preview(frame, landmarks(), True)
    np.testing.assert_array_equal(frame, original)


def test_preview_preserves_camera_aspect_and_landmark_mapping():
    from live_runtime import preview_geometry, preview_point
    fitted, offset = preview_geometry((480, 640, 3))
    assert fitted == (720, 540)
    assert offset == (120, 0)
    assert fitted[0] / fitted[1] == 640 / 480
    assert preview_point((0, 0), fitted, offset) == (839, 0)
    assert preview_point((1, 1), fitted, offset) == (120, 539)
    fitted, offset = preview_geometry((720, 1280, 3))
    assert fitted == (960, 540)
    assert offset == (0, 0)


def test_natural_face_position_locks_automatically_without_center_alignment(monkeypatch):
    import itertools
    import live_runtime
    points = landmarks()
    points[4].y = 0.724
    capture = SimpleNamespace(last_landmarks=points, face_anchor=None)
    capture.read = lambda now: (np.zeros((480, 640, 3), dtype=np.uint8), extract(points, 640, 480), [0.2, 0.2], 'OK')
    ticks = itertools.count(0, 0.05)
    monkeypatch.setattr(live_runtime.time, 'monotonic', lambda: next(ticks))
    monkeypatch.setattr(live_runtime.cv2, 'imshow', lambda *args: None)
    monkeypatch.setattr(live_runtime.cv2, 'waitKey', lambda *args: -1)
    monkeypatch.setattr(live_runtime.cv2, 'getWindowProperty', lambda *args: 1)
    live_runtime.run_positioning(capture, replace(Config(), tracking_validation_duration=0.1), 'test')
    assert capture.face_anchor == pytest.approx([0.5, 0.724])
    assert live_runtime.face_in_position(points, capture.face_anchor)


def test_calibration_reference_recovers_existing_position(tmp_path):
    from model_loading import calibration_reference
    config = replace(Config(), data_dir=tmp_path)
    folder = tmp_path / 'U001' / 'S001'
    folder.mkdir(parents=True)
    (folder / 'session.json').write_text(json.dumps({'status': 'complete'}))
    (folder / 'invalid_frames.jsonl').write_text(json.dumps({'trial_id': 'face_positioning', 'ready': True,
                                                            'nose_position': [0.49, 0.60]}) + '\n')
    assert calibration_reference(config, 'U001', 'S001') == pytest.approx([0.49, 0.60])


@pytest.mark.parametrize('matches', [True, False])
def test_personalized_startup_requires_saved_posture(monkeypatch, matches):
    import itertools
    import live_runtime
    points = landmarks()
    points[4].y = 0.724
    capture = SimpleNamespace(last_landmarks=points, face_anchor=None)
    capture.read = lambda now: (np.zeros((480, 640, 3), dtype=np.uint8), extract(points, 640, 480), [0.2, 0.2], 'OK')
    ticks = itertools.count(0, 0.05)
    monkeypatch.setattr(live_runtime.time, 'monotonic', lambda: next(ticks))
    monkeypatch.setattr(live_runtime.cv2, 'imshow', lambda *args: None)
    monkeypatch.setattr(live_runtime.cv2, 'waitKey', lambda *args: -1)
    monkeypatch.setattr(live_runtime.cv2, 'getWindowProperty', lambda *args: 1)
    config = replace(Config(), tracking_validation_duration=0.1, tracking_validation_timeout=0.3)
    reference = [0.5, 0.724] if matches else [0.5, 0.3]
    if matches:
        live_runtime.run_positioning(capture, config, 'test', reference=reference)
        assert capture.face_anchor == pytest.approx(reference)
    else:
        with pytest.raises(TimeoutError):
            live_runtime.run_positioning(capture, config, 'test', reference=reference)
        assert capture.face_anchor is None
