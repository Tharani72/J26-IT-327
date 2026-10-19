import json
from pathlib import Path

from app.feature_contract import FEATURES
from app.model_service import ModelService
from app.seed_sync import build_expected_records, load_seed_payload

ROOT = Path(__file__).resolve().parents[1]


def test_model_artifact_and_metadata_use_exact_feature_order():
    metadata_path = ROOT / "artifacts" / "Day14_10000_Model_Metadata.json"
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    assert tuple(metadata["features"]) == FEATURES

    model = ModelService.load(ROOT / "artifacts" / "Day14_10000_Linear_Regression.joblib", metadata_path)
    assert model.features == FEATURES
    assert len(model.features) == 14


def test_model_predicts_from_latest_feature_vector_without_claiming_validation():
    payload = load_seed_payload()
    _, sessions = build_expected_records(payload)
    model = ModelService.load(
        ROOT / "artifacts" / "Day14_10000_Linear_Regression.joblib",
        ROOT / "artifacts" / "Day14_10000_Model_Metadata.json",
    )
    result = model.predict(sessions[0])
    assert 0 <= result.value <= 100
    assert "not yet performed" in model.metadata["real_world_validation"].lower()