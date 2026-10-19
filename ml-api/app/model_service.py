import hashlib
import json
import math
import warnings
from dataclasses import dataclass
from pathlib import Path
from typing import Mapping

import joblib
import numpy as np

from .feature_contract import FEATURES


@dataclass(frozen=True)
class ModelPrediction:
    raw_value: float
    value: float
    was_clipped: bool


class ModelContractError(ValueError):
    pass


class ModelService:
    def __init__(self, model, metadata: dict, model_version: str):
        self.model = model
        self.metadata = metadata
        self.model_version = model_version
        self.features = tuple(metadata["features"])

    @classmethod
    def load(cls, model_path: Path, metadata_path: Path) -> "ModelService":
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        features = metadata.get("features")
        if not isinstance(features, list) or tuple(features) != FEATURES:
            raise ModelContractError("Model metadata feature names or order do not match the verified contract.")

        model = joblib.load(model_path)
        model_features = getattr(model, "feature_names_in_", None)
        if model_features is None or tuple(str(name) for name in model_features) != FEATURES:
            raise ModelContractError("Loaded model feature names or order do not match metadata.")
        if getattr(model, "n_features_in_", None) != len(FEATURES):
            raise ModelContractError("Loaded model does not accept exactly 14 features.")

        digest = hashlib.sha256(model_path.read_bytes()).hexdigest().upper()
        return cls(model=model, metadata=metadata, model_version=digest)

    def predict(self, row: Mapping[str, object]) -> ModelPrediction:
        missing = [feature for feature in self.features if feature not in row]
        if missing:
            raise ModelContractError("Prediction row is missing a required model feature.")

        values = [float(row[feature]) for feature in self.features]
        if not all(math.isfinite(value) for value in values):
            raise ModelContractError("Prediction row contains a non-finite model feature.")

        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", message="X does not have valid feature names", category=UserWarning)
            raw = float(self.model.predict(np.asarray([values], dtype=float))[0])
        bounded = min(100.0, max(0.0, raw))
        return ModelPrediction(raw_value=raw, value=bounded, was_clipped=bounded != raw)