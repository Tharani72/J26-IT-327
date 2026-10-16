"""Collect valid, rate-controlled calibration and separate independent trials."""
import argparse
import csv
import json
from dataclasses import asdict, replace
from pathlib import Path
import time
from contextlib import ExitStack,nullcontext
import cv2
from config import load_config, safe_id
from live_runtime import LiveCapture, timestamp, render, open_window, run_positioning, add_face_preview, face_in_position, wait_for_recording_start, begin_fixation_display
from collection_schema import SAMPLE_COLUMNS, validate_samples, SESSION_FEATURE_SCHEMA
from privacy import require_adult_pilot, confirm_adult_preview
from session_storage import new_session, atomic_write_json, session_lock
from target_display import collection_dpi_context
from target_collection import collect_target_trials, validate_target_collection, validate_tracking, recover_collection_session, TRIAL_FILE, SAMPLE_FILE, EVENT_FILE
from target_protocol import METADATA_VERSION
from eye_crops import CropSettings
from image_storage import ImagePairStore, IMAGE_VERSION, RECORD_DIR, reconcile_image_session
from pilot_session import PILOT_VERSION, STATISTICS_FILE, pilot_config, validate_pilot_samples
from guided_ui import guided_capture, run_loading, show_stage, show_outcome
from dataset_guard import guarded


@guarded(lambda args: args['config'].data_dir)
def collect(user, session, config, windowed=False, *, adult_pilot_confirmed=False, open_results=False, camera_size=None, position_guidance=None, face_lock_options=None, reduced_motion=False,visualization_mode=None,study_profile=None,child_permissions=None,living_characters=False,animation_mode=None,character_size=200,operator_ui=None,capture_options=None):
    child=child_permissions is not None
    if child and capture_options is not None:raise PermissionError('Isolated pilot capture options are adult-only')
    if child:
        from privacy import require_child_permissions
        require_child_permissions(child_permissions)
        if adult_pilot_confirmed or study_profile is None or config.collection_protocol!='five_point_pilot':raise PermissionError('Child collection requires separate approved study mode')
    else:require_adult_pilot(adult_pilot_confirmed)
    import pandas as pd
    safe_id(user)
    safe_id(session)
    from research_dataset import require_enrollment
    require_enrollment(config.data_dir, user,cohort='child' if child else 'adult')
    # Collection validates samples and tracking; it does not require a gaze predictor.
    pilot = config.collection_protocol == 'five_point_pilot'
    visual=None
    if living_characters:
        if not pilot:raise ValueError('Living characters require the automatic five-point pilot')
        if reduced_motion and animation_mode=='animated':raise ValueError('Animated mode conflicts with reduced motion')
        from living_targets import session_visual
        visual=session_visual(session,animation_mode or ('reduced' if reduced_motion else 'animated'),size_px=character_size)
        reduced_motion=visual['animation_mode']!='animated'
    elif animation_mode is not None or character_size!=200:raise ValueError('Animation mode/size requires living characters')
    if study_profile is not None:
        if not pilot:raise ValueError('Study mode requires the existing automatic pilot')
        from study_registry import reservation
        _,claim=reservation(config.data_dir,user,session)
        if claim['status']!='preview' or claim.get('study_consent_verified') is not True:
            raise PermissionError('A consent-verified PREVIEW reservation is required')
        if child and (claim.get('participant_cohort')!='child' or claim.get('child_permissions')!=child_permissions):raise PermissionError('Child reservation consent mismatch')
    if visualization_mode not in (None,'off','essential','full'):raise ValueError('Unknown visualization mode')
    if visualization_mode is not None and not pilot:raise ValueError('Visualization requires the automatic pilot')
    if pilot:face_lock_options={'recovery_seconds':2.,**(face_lock_options or {})}
    if camera_size is not None and (not pilot or camera_size not in ((1280,720),(1920,1080))):
        raise ValueError('Requested camera size is only supported for the automatic pilot')
    folder = config.data_dir / user / session
    if folder.exists():
        raise FileExistsError('Session already exists; use a fresh session ID')
    csv_path = folder / 'samples.csv'
    protocol = {k: str(v) if isinstance(v, Path) else v for k, v in asdict(config).items()}
    protocol.update(user_id=user, participant_id=user, session_id=session,
                    label_semantics='true_region is the instructed target, not measured gaze',
                    image_recording_enabled=True, image_dataset_schema_version=IMAGE_VERSION,
                    image_record_metadata=RECORD_DIR,
                    feature_schema=SESSION_FEATURE_SCHEMA,
                    target_metadata_version=METADATA_VERSION,
                    target_trial_metadata=TRIAL_FILE, target_sample_metadata=SAMPLE_FILE, target_event_metadata=EVENT_FILE)
    if visual is not None:protocol['character_visual']=visual
    if pilot:
        from multi_resolution import VERSION as EXPERIMENTAL_VERSION
        from face_lock import LockSettings
        if visualization_mode is not None:
            protocol['landmark_visualization']=dict(version='1.0.0',initial_mode=visualization_mode,
                                                    semantics='local diagnostic rendering only')
        protocol.update(pilot_protocol_version=PILOT_VERSION, capture_statistics_file=STATISTICS_FILE,
                        experimental_eye_schema_version=EXPERIMENTAL_VERSION,
                        requested_camera_resolution=list(camera_size or getattr(operator_ui,'capture_options',{}).get('camera_size') or (1280,720)),
                        face_alignment_protocol_version='4.0.0' if (face_lock_options or {}).get('recovery_mode')=='soft' else '3.0.0',face_lock_settings=asdict(LockSettings(**(face_lock_options or {}))),
                        face_lock_diagnostic_file='face_lock_events.v1.jsonl',brief_blink_policy='one_measured_closed_frame_v1',
                        fixation_visual_version='focus-quest-1.0.0',reduced_motion=bool(reduced_motion),
                        planned_target_trials=5, failed_trial_policy='stop_incomplete_no_automatic_retry',
                        gaze_prediction_accuracy='NOT YET EVALUATED')
        protocol['adaptive_tracking']=dict(version='1.0.0',head_measurements='Reference face-axis normalized; raw limits unchanged',
            multiple_face_policy='Pause until operator I confirms original participant with fresh single-face/head/eye evidence; U requires new session and F',
            identity_semantics='Operator verification, not biometric recognition',source_detail_guidance='Native ROI dimensions, no digital zoom')
        if visual is not None:protocol['fixation_visual_version']=visual['visual_version']
    if study_profile is not None:
        from single_eye_storage import QualityPolicy,VERSION,VERSIONS
        SINGLE_VERSION=study_profile.get('image_schema_version',VERSION)
        if SINGLE_VERSION not in VERSIONS:raise ValueError('Unknown study image format')
        if study_profile.get('camera_startup_profile') is not None:
            protocol['camera_startup_profile']=study_profile['camera_startup_profile']
        if study_profile.get('landmark_inference_dimensions') is not None:
            protocol['landmark_inference_dimensions']=study_profile['landmark_inference_dimensions']
            protocol['landmark_coordinate_mapping']='full_frame_normalized_xy_identity'
        native_opt_in=study_profile.get('native_eye_storage',False)
        if study_profile.get('child_quality_review_required') is True:
            if not child or native_opt_in is not True:raise PermissionError('Child quality review requires child native storage')
            protocol['child_quality_review_required']=True
        if type(native_opt_in) is not bool:raise ValueError('Native storage opt-in must be boolean')
        if native_opt_in:
            from native_eye_storage import VERSION as NATIVE_VERSION
            protocol['native_eye_storage_version']=NATIVE_VERSION
            layout=study_profile.get('native_eye_image_layout','flat-v1')
            if layout not in ('flat-v1','target-folders-v1'):raise ValueError('Invalid native-eye image layout')
            protocol['native_eye_image_layout']=layout
        planned=study_profile.get('planned_observations_per_target',14)
        if isinstance(planned,bool) or not isinstance(planned,int) or planned<1:raise ValueError('Invalid planning count')
        protocol.pop('experimental_eye_schema_version',None)
        protocol.update(image_dataset_schema_version=SINGLE_VERSION,single_eye_image_schema_version=SINGLE_VERSION,
            study_consent_verified=True,study_registry_version='2.0.0',planning_pairs_per_target=planned,
            single_image_quality_policy=asdict(QualityPolicy(**study_profile.get('quality_policy',{}))),
            saved_eye_dimensions=[160,96],image_count_per_observation=2)
    name = 'OMNISIGN calibration'
    if child:
        protocol.update(collection_mode='approved_child_study',participant_cohort='child',adult_pilot_confirmed=False,
                        child_permissions=child_permissions,consent_evidence='operator_attestation_not_document_verification')
        protocol['child_storage_policy']=study_profile.get('child_storage_policy',dict(minimum_free_mb=1024))
    try:
        with collection_dpi_context(), ExitStack() as resources:
            if pilot:
                embedded=operator_ui is not None and getattr(operator_ui,'embedded_preview',False)
                options=dict({'camera_size':camera_size} if camera_size else {})
                options.update(capture_options or {})
                options.update(getattr(operator_ui,'capture_options',{}))
                device=LiveCapture(config,**options)
                if getattr(operator_ui,'capture_profile',None)=='isolated-mjpg-1080p':
                    if not embedded:raise PermissionError('GUI MJPG profile requires consent-verified embedded GUI workflow')
                    from gui_mjpg_capture import GUIHighResolutionCapture
                    device=GUIHighResolutionCapture(config,diagnostics=options.get('diagnostics'),
                        cancel_check=lambda:operator_ui.cancelled)
                    protocol['camera_capture_profile']='isolated-mjpg-1080p'
                    protocol['requested_camera_resolution']=[1920,1080]
                    protocol['requested_camera_fourcc']='MJPG'
                if embedded:
                    from embedded_capture import embedded_capture
                    capture=resources.enter_context(embedded_capture(device,operator_ui))
                else:
                    open_window(name, windowed)
                    capture=resources.enter_context(guided_capture(device,name))
                capture.position_guidance_options=position_guidance
                capture.operator_ui=operator_ui
                capture.preview_windowed=True if operator_ui is not None else windowed
                capture.face_lock_options=face_lock_options
                if study_profile is not None:
                    capture.crop_output_size=(160,96)
                    capture.crop_color_mode='BGR' if SINGLE_VERSION=='3.0.0' else 'L'
                    capture.instruction_language=study_profile.get('instruction_language')
                    if study_profile.get('instruction_audio'):
                        from child_accessibility import InstructionAudio
                        capture.instruction_audio=InstructionAudio(study_profile['instruction_audio'])
                        resources.callback(capture.instruction_audio.stop)
                capture.reduced_motion=reduced_motion
                if visualization_mode is not None and not embedded:
                    from landmark_visualization import Visualization
                    capture.visualization=Visualization(visualization_mode,requested=camera_size or (1280,720))
                    if study_profile is not None:capture.visualization.eye_previews=True
                    resources.callback(capture.visualization.close)
            else:
                capture = resources.enter_context(LiveCapture(config))
                open_window(name, windowed)
            if pilot:
                instruction = f'Follow one dot: 5 targets | {config.settling_time:g}s settle + {config.collection_duration:g}s record | P/Space pauses'
                wait_for_recording_start(capture, name, True, instruction)
                if embedded:open_window(name,windowed)
                if windowed:
                    begin_fixation_display(name,windowed=True)
                else:
                    begin_fixation_display(name)
            else:
                wait_for_recording_start(capture, name, True)
            if operator_ui is not None:
                protocol.update(recording_start_action=operator_ui.authorization_action,operator_ui_version='1.0.0',
                                operator_eye_clarity_confirmed=operator_ui.clarity_confirmed())
            _record(capture, name, folder, csv_path, protocol, config, user, session)
    except BaseException as error:
        # Only this invocation's newly created pilot may receive a failure report.
        if pilot and protocol.get('session_manifest_version') and folder.is_dir():
            try:
                manifest = folder/'session.json'
                with session_lock(folder):
                    current = json.loads(manifest.read_text(encoding='utf-8'))
                    if current.get('status') == 'complete':
                        current.update(status='incomplete', interruption_reason='resource_cleanup_failed_after_validation')
                        atomic_write_json(manifest, current)
            except Exception as error:
                print(f'Could not finalize cleanup failure status: {error}; explicit recovery may be required.')
            _report_after_shutdown(folder, open_results=False)
        if pilot and not (operator_ui is not None and getattr(operator_ui,'embedded_preview',False)):
            try:
                show_outcome(name,error=error)
                _wait_outcome(name)
            except Exception:
                pass  # Preserve the capture/storage error if display cleanup also fails.
        raise
    if pilot:
        _report_after_shutdown(folder, open_results=open_results, guided=operator_ui is None)
    return csv_path


def _wait_outcome(name):
    """Completion is inspectable after release; closing it never changes data status."""
    try:
        while cv2.getWindowProperty(name, cv2.WND_PROP_VISIBLE) >= 1:
            if cv2.waitKey(30)&0xFF in (ord('q'),ord('Q'),27,13,32):
                break
    except cv2.error:
        pass  # HighGUI may remove the native handle when the participant closes it.
    finally:
        cv2.destroyAllWindows()


def _report_after_shutdown(folder, *, open_results=False, guided=False):
    print(f'Session output directory: {folder.resolve()}')
    try:
        from session_report import write_session_report
        if guided:
            name='OMNISIGN results'
            cv2.namedWindow(name,cv2.WINDOW_NORMAL)
            report=run_loading(name,lambda:write_session_report(folder),'GENERATING_REPORT',
                               'Generating private local results',cancelable=False)
            summary=json.loads((report.parent/'summary.v1.json').read_text(encoding='utf-8'))
            show_outcome(name,summary=summary)
        else:
            report = write_session_report(folder)
        print(f'Local results report: {report}')
        if open_results:
            import webbrowser
            webbrowser.open(report.resolve().as_uri())
        if guided:
            _wait_outcome(name)
        return report
    except Exception as error:
        print(f'Report could not be generated: {error}. Session data/status were not changed; use --view-results after resolving it.')
        if guided:
            try:
                show_outcome(name,error=error)
                _wait_outcome(name)
            except Exception:
                pass
        return None


def _record(capture, name, folder, csv_path, protocol, config, user, session):
    import pandas as pd
    if protocol.get('participant_cohort')=='child':
        from child_dataset_status import storage_preflight
        protocol['storage_preflight']=storage_preflight(config.data_dir,protocol.get('child_storage_policy',{}).get('minimum_free_mb',1024))
    if config.collection_protocol=='five_point_pilot':
        protocol['camera_position_quality']=getattr(capture,'position_quality_summary',None)
        protocol['instruction_rendering']=vars(capture).get('instruction_rendering')
    with new_session(folder, protocol) as manifest:
        from multi_resolution import MultiResolutionStore,reconcile_multi
        store = MultiResolutionStore if config.collection_protocol == 'five_point_pilot' else ImagePairStore
        if protocol.get('single_eye_image_schema_version'):
            from single_eye_storage import SingleEyeStore
            from study_registry import transition
            lock=vars(capture).get('face_lock')
            if lock is None or lock.reference is None:raise PermissionError('Explicit F face reference required')
            protocol.update(face_reference_locked=True,face_reference_lock_action='F')
            atomic_write_json(manifest,protocol)
            transition(config.data_dir,user,session,'recording',**({'recording_action':protocol['recording_start_action']} if protocol.get('recording_start_action')=='GUI_START' else {}))
            store=SingleEyeStore
        images = store(folder, CropSettings(config.eye_crop_horizontal_margin,
            config.eye_crop_vertical_margin, config.eye_crop_minimum_width, config.eye_crop_minimum_height))
        from face_lock_diagnostics import FILE as DIAGNOSTIC_FILE
        diagnostic_context=(folder/DIAGNOSTIC_FILE).open('x',encoding='utf-8') if config.collection_protocol=='five_point_pilot' else nullcontext(None)
        with csv_path.open('x', newline='', encoding='utf-8') as stream, (folder / 'invalid_frames.jsonl').open('x', encoding='utf-8') as invalid, diagnostic_context as diagnostics:
            capture.face_lock_diagnostics=diagnostics
            writer = csv.DictWriter(stream, fieldnames=SAMPLE_COLUMNS)
            writer.writeheader()
            if config.collection_protocol == 'five_point_pilot':
                show_stage(name,'PREPARING_SESSION','Preparing fullscreen target presentation',
                           'Camera active in background. No accepted samples during setup.')
            if config.collection_protocol!='five_point_pilot' or getattr(capture,'face_lock',None) is None:
                run_positioning(capture, config, name, invalid)
            protocol['face_anchor'] = capture.face_anchor.tolist()
            if config.collection_protocol=='five_point_pilot':
                protocol['face_reference_locked']=getattr(capture,'face_lock',None) is not None
                protocol['face_reference_lock_action']='F' if protocol['face_reference_locked'] else None
            atomic_write_json(manifest, protocol)
            display = validate_tracking(capture, name, config, invalid)
            display.reduced_motion=getattr(capture,'reduced_motion',False)
            display.character_visual=protocol.get('character_visual')
            collect_target_trials(capture, name, folder, writer, stream, invalid, config, user, session, display, images)
        def validate():
            if config.collection_protocol == 'five_point_pilot':
                validate_pilot_samples(csv_path, config)
            else:
                validate_samples(pd.read_csv(csv_path, dtype={'user_id': str, 'session_id': str}), config)
            validate_target_collection(csv_path, config)
            if not reconcile_image_session(folder)['consistent']:
                raise ValueError('Image pairs/target samples are inconsistent; session is incomplete')
            if protocol.get('experimental_eye_schema_version') and not reconcile_multi(folder)['consistent']:
                raise ValueError('Multi-resolution image transaction failed integrity checks')
        if config.collection_protocol == 'five_point_pilot':
            # End capture before potentially lengthy final integrity validation.
            capture.close()
            cv2.namedWindow(name,cv2.WINDOW_NORMAL)
            run_loading(name,validate,'SAVING_RESULTS','Finalizing and validating saved image pairs',cancelable=False)
        else:
            validate()
    return csv_path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--user', help='Required for collection/recovery; not needed for read-only preview')
    parser.add_argument('--session', help='Required for collection/recovery; not needed for read-only preview')
    parser.add_argument('--config', type=Path)
    parser.add_argument('--windowed', action='store_true')
    parser.add_argument('--reduced-motion',action='store_true',help='Static plain focus ring; no decorative glow during the pilot')
    parser.add_argument('--living-characters',action='store_true',help='Original fixed-center vector characters; requires S### session ID and automatic pilot')
    parser.add_argument('--animation-mode',choices=('animated','reduced','off'),help='Peripheral motion only; reduced/off are static')
    parser.add_argument('--character-size',type=int,choices=range(160,241),default=200,metavar='160..240',help='Living character size at 1920x1080 physical pixels')
    parser.add_argument('--seed', type=int, help='Reproducible randomized target order (overrides config.random_seed)')
    parser.add_argument('--live-preview', action='store_true', help='ADULT-only read-only eye/crop verification; R cannot record')
    parser.add_argument('--landmark-visualization',nargs='?',const='essential',choices=('off','essential','full'),help='Local researcher overlay and L/M/D/E controls; disabled when omitted')
    parser.add_argument('--preview-targets', action='store_true', help='Rehearse measured five-point targets in read-only preview')
    parser.add_argument('--native-preview', action='store_true', help='Show unmirrored camera preview (crop panels are always native)')
    parser.add_argument('--preview-timing', action='store_true', help='Show read-only rolling stage timings and print aggregate milliseconds')
    parser.add_argument('--camera-index', type=int, help='Override selected webcam for this run without saving camera configuration')
    parser.add_argument('--camera-resolution',choices=('1280x720','1920x1080'),help='Automatic pilot requested capture size; actual dimensions are verified/recorded')
    parser.add_argument('--position-guidance',type=Path,help='Optional JSON heuristic guidance settings; never recording gates')
    parser.add_argument('--face-lock-config',type=Path,help='Optional JSON scale/roll/pose/recovery settings; original translation tolerance remains')
    parser.add_argument('--face-lock-mode',choices=('strict','soft'),help='Opt-in bounded soft recovery; strict is the default for A/B reproducibility')
    parser.add_argument('--auto-five-point', action='store_true', help='Automatic adult pilot: five trials, 2s settle + 3s collect per target, still requires R')
    parser.add_argument('--settling-time', type=float, help='Pilot settling seconds (default 2)')
    parser.add_argument('--collection-time', type=float, help='Pilot collection seconds per target (default 3)')
    parser.add_argument('--sampling-rate', type=float, help='Pilot maximum sample rate (default configured value)')
    parser.add_argument('--minimum-samples-per-trial', type=int, help='Pilot minimum accepted pairs per target (default 5); failure stops session')
    parser.add_argument('--view-results', action='store_true', help='Generate a new local report for a stopped five-point pilot; never opens the camera')
    parser.add_argument('--open-results', action='store_true', help='Explicitly open the local HTML report; images still require a separate click')
    parser.add_argument('--recover-interrupted', action='store_true',
                        help='Mark a stopped Phase A session incomplete; never resume or change CSVs')
    args = parser.parse_args()
    if args.landmark_visualization is not None and not (args.auto_five_point or args.live_preview):
        parser.error('--landmark-visualization requires --auto-five-point or --live-preview')
    if args.reduced_motion and not args.auto_five_point:parser.error('--reduced-motion requires --auto-five-point')
    if args.living_characters and not args.auto_five_point:parser.error('--living-characters requires --auto-five-point')
    if args.animation_mode and not args.living_characters:parser.error('--animation-mode requires --living-characters')
    if args.character_size!=200 and not args.living_characters:parser.error('--character-size requires --living-characters')
    if args.reduced_motion and args.animation_mode=='animated':parser.error('Choose reduced motion or animated, not both')
    face_lock_options=None
    if args.face_lock_config:
        if not args.auto_five_point:parser.error('--face-lock-config requires --auto-five-point')
        from face_lock import LockSettings
        face_lock_options=asdict(LockSettings(**json.loads(args.face_lock_config.read_text(encoding='utf-8'))))
    if args.face_lock_mode:
        if not args.auto_five_point:parser.error('--face-lock-mode requires --auto-five-point')
        face_lock_options={**(face_lock_options or {}),'recovery_mode':args.face_lock_mode}
    position_guidance=None
    if args.position_guidance:
        if not args.auto_five_point:parser.error('--position-guidance requires --auto-five-point')
        from position_check import Guidance
        position_guidance=asdict(Guidance(**json.loads(args.position_guidance.read_text(encoding='utf-8'))))
    if args.camera_resolution and not args.auto_five_point:
        parser.error('--camera-resolution requires --auto-five-point')
    if sum((args.live_preview, args.auto_five_point, args.view_results, args.recover_interrupted)) > 1:
        parser.error('Preview, automatic collection, results and recovery are separate modes')
    if args.open_results and not (args.auto_five_point or args.view_results):
        parser.error('--open-results requires --auto-five-point or --view-results')
    overrides = {key:value for key,value in dict(settling_time=args.settling_time,
        collection_duration=args.collection_time, sampling_rate=args.sampling_rate,
        minimum_samples_per_trial=args.minimum_samples_per_trial).items() if value is not None}
    if overrides and not args.auto_five_point:
        parser.error('Pilot timing/sample overrides require --auto-five-point')
    if args.live_preview and args.recover_interrupted:
        parser.error('--live-preview cannot be combined with --recover-interrupted')
    if (args.preview_targets or args.native_preview or args.preview_timing) and not args.live_preview:
        parser.error('--preview-targets/--native-preview/--preview-timing require --live-preview')
    if not args.live_preview and (not args.user or not args.session):
        parser.error('--user and --session are required for collection/recovery')
    if args.camera_index is not None and args.camera_index < 0:
        parser.error('--camera-index must be nonnegative')
    config = load_config(args.config)
    if args.auto_five_point:
        settings = {}
        if args.config:
            supplied = json.loads(args.config.read_text(encoding='utf-8'))
            settings = {key:supplied[key] for key in ('settling_time','collection_duration','sampling_rate','minimum_samples_per_trial') if key in supplied}
        settings.update(overrides)
        config = pilot_config(config, **settings)
    if args.camera_index is not None:
        config = replace(config, camera_index=args.camera_index)
    if args.seed is not None:
        config = replace(config, random_seed=args.seed)
    if args.live_preview:
        from eye_verification import run_live_preview
        eligibility = confirm_adult_preview()
        print('READ ONLY verification: R cannot record. Q/Esc or closing either window exits.')
        run_live_preview(config, adult_pilot_confirmed=eligibility, mirrored=not args.native_preview,
                         targets=args.preview_targets, windowed=args.windowed,
                         **({'visualization_mode':args.landmark_visualization} if args.landmark_visualization is not None else {}),
                         **({'timing': True} if args.preview_timing else {}))
        return
    safe_id(args.user)
    safe_id(args.session)
    if args.view_results:
        if _report_after_shutdown(config.data_dir/args.user/args.session, open_results=args.open_results) is None:
            raise SystemExit(1)
        return
    if args.recover_interrupted:
        print(recover_collection_session(config.data_dir / args.user / args.session))
        return
    eligibility = confirm_adult_preview()
    try:
        print(collect(args.user, args.session, config, args.windowed, adult_pilot_confirmed=eligibility,
                      **({'camera_size':tuple(map(int,(args.camera_resolution or '1920x1080').split('x')))} if args.auto_five_point else {}),
                      **({'position_guidance':position_guidance} if position_guidance else {}),
                      **({'face_lock_options':face_lock_options} if face_lock_options else {}),
                      **({'reduced_motion':True} if args.reduced_motion else {}),
                      **({'living_characters':True,'animation_mode':args.animation_mode,'character_size':args.character_size} if args.living_characters else {}),
                      **({'visualization_mode':args.landmark_visualization} if args.landmark_visualization is not None else {}),
                      **({'open_results': True} if args.open_results else {})))
    except InterruptedError as error:
        print(f'Collection cancelled: {error}. No incomplete session is marked successful.')


if __name__ == '__main__':
    main()
