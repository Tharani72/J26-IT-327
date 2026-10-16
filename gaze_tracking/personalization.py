"""Fit on calibration trials only; compare all models on the same untouched test."""
import argparse
from dataclasses import asdict
import hashlib
import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix, classification_report
from columbia_features import FEATURE_NAMES
from config import REGIONS, load_config, safe_id
from model_loading import load_model
from dataset_guard import guarded

from collection_schema import METADATA_COLUMNS, SAMPLE_COLUMNS, validate_samples


@guarded(lambda args: Path(args['csv_path']).resolve().parent.parent.parent)
def train_and_compare(csv_path, config):
    csv_path = Path(csv_path)
    manifest = csv_path.parent / 'session.json'
    if manifest.is_file():
        session_metadata = json.loads(manifest.read_text(encoding='utf-8'))
        if session_metadata.get('status') != 'complete':
            raise ValueError('Collection session was not completed')
        for name in ('camera_index', 'calibration_trials', 'test_trials', 'settling_time',
                     'collection_duration', 'sampling_rate', 'minimum_samples_per_trial'):
            if session_metadata.get(name) != getattr(config, name):
                raise ValueError(f'Configuration differs from collection protocol: {name}')
    df = pd.read_csv(csv_path, dtype={'user_id': str, 'session_id': str})
    calibration, test = validate_samples(df, config)
    user, session = df.user_id.iloc[0], df.session_id.iloc[0]
    models = {'no_calibration': load_model(config.general_model, config.general_metadata)}
    output = config.model_dir / user / session
    results = config.results_dir / user / session
    # Preserve prior fits and measurements rather than silently replacing them.
    if output.exists() or results.exists():
        raise FileExistsError('Model/results session already exists; use a fresh session ID')
    output.mkdir(parents=True)
    results.mkdir(parents=True)
    provenance = {'features': FEATURE_NAMES, 'labels': REGIONS,
                  'source_sha256': hashlib.sha256(csv_path.read_bytes()).hexdigest(),
                  'user_id': user, 'session_id': session,
                  'protocol': {k: str(v) if isinstance(v, Path) else v for k, v in asdict(config).items()},
                  'strategy': 'Personal samples only; no general-data mixing or oversampling; fixed base-model hyperparameters',
                  'test_trial_ids': sorted(test.trial_id.unique().tolist())}
    import platform
    import sklearn
    provenance['versions'] = {'python': platform.python_version(), 'sklearn': sklearn.__version__,
                              'numpy': np.__version__, 'pandas': pd.__version__, 'joblib': joblib.__version__}
    for condition in ('short', 'full'):
        selected = calibration
        if condition == 'short':
            ids = {f'calibration_{region}_{trial}' for region in REGIONS for trial in range(1, config.short_trials + 1)}
            selected = calibration[calibration.trial_id.isin(ids)]
        model = Pipeline([('scaler', StandardScaler()),
                          ('svm', SVC(kernel='rbf', C=config.svm_c, gamma=config.svm_gamma))])
        model.fit(selected[FEATURE_NAMES], selected.true_region)
        metadata = {**provenance, 'condition': condition, 'training_rows': len(selected),
                    'training_trial_ids': sorted(selected.trial_id.unique().tolist())}
        model_path = output / f'{condition}_model.joblib'
        meta_path = output / f'{condition}_metadata.json'
        joblib.dump(model, model_path)
        meta_path.write_text(json.dumps(metadata, indent=2), encoding='utf-8')
        models[condition] = load_model(model_path, meta_path)
    rows = []
    predictions = test[METADATA_COLUMNS].copy()
    for condition, model in models.items():
        predicted = model.predict(test[FEATURE_NAMES])
        scores = f1_score(test.true_region, predicted, labels=REGIONS, average=None, zero_division=0)
        rows.append({'user_id': user, 'session_id': session, 'condition': condition,
                     'accuracy': accuracy_score(test.true_region, predicted),
                     'macro_f1': f1_score(test.true_region, predicted, labels=REGIONS, average='macro', zero_division=0),
                     **{region.lower() + '_f1': score for region, score in zip(REGIONS, scores)}})
        pd.DataFrame(confusion_matrix(test.true_region, predicted, labels=REGIONS), index=REGIONS, columns=REGIONS).to_csv(results / f'{condition}_confusion_matrix.csv')
        (results / f'{condition}_report.json').write_text(json.dumps(classification_report(test.true_region, predicted, labels=REGIONS, output_dict=True, zero_division=0), indent=2), encoding='utf-8')
        predictions[condition] = predicted
    comparison = pd.DataFrame(rows)
    comparison.to_csv(results / 'calibration_comparison.csv', index=False)
    predictions.to_csv(results / 'independent_predictions.csv', index=False)
    (results / 'provenance.json').write_text(json.dumps(provenance, indent=2), encoding='utf-8')
    return comparison, results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('csv', type=Path)
    parser.add_argument('--config', type=Path)
    args = parser.parse_args()
    comparison, results = train_and_compare(args.csv, load_config(args.config))
    print(comparison.to_string(index=False))
    print(f'Results: {results}')


if __name__ == '__main__':
    main()
