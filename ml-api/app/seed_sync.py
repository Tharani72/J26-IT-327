import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping, Sequence

from .feature_contract import DEMO_STUDENT_CODES, FEATURES

def percentage_to_fraction(value: Any) -> float:
    percentage = float(value)
    if not math.isfinite(percentage) or percentage < 0 or percentage > 100:
        raise ValueError("Percentage ratio must be between 0 and 100.")
    return percentage / 100.0


@dataclass(frozen=True)
class SyncPlan:
    missing_students: tuple[dict[str, Any], ...]
    missing_sessions: tuple[dict[str, Any], ...]
    conflicts: tuple[str, ...]


def load_seed_payload(path: Path | None = None) -> dict[str, Any]:
    source = path or Path(__file__).resolve().parents[1] / "data" / "demo_seed.json"
    payload = json.loads(source.read_text(encoding="utf-8"))
    for student in payload.get("students", []):
        for key in ("full_name", "grade"):
            value = student.get(key)
            if isinstance(value, str) and value.startswith("\\u"):
                student[key] = value.encode("ascii").decode("unicode_escape")
    return payload


def build_expected_records(payload: Mapping[str, Any]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    source_students = list(payload.get("students", []))
    if any(student.get("data_source", "synthetic") != "synthetic" for student in source_students):
        raise ValueError("Seed profiles must be synthetic.")
    students = [{**student, "data_source": "synthetic"} for student in source_students]
    codes = {str(student.get("student_code", "")).upper() for student in students}
    if len(students) != len(DEMO_STUDENT_CODES) or codes != DEMO_STUDENT_CODES:
        raise ValueError("Seed must contain exactly the five approved synthetic demo students.")

    rows_by_code: dict[str, list[dict[str, Any]]] = {code: [] for code in DEMO_STUDENT_CODES}
    for raw in payload.get("raw_sessions", []):
        code = str(raw.get("student_id", "")).upper()
        if code not in rows_by_code:
            raise ValueError("Seed contains a student outside the demo allowlist.")
        rows_by_code[code].append(dict(raw))

    sessions: list[dict[str, Any]] = []
    for code in sorted(DEMO_STUDENT_CODES):
        rows = sorted(rows_by_code[code], key=lambda item: int(item["session_number"]))
        if not rows or [int(row["session_number"]) for row in rows] != list(range(1, len(rows) + 1)):
            raise ValueError("Demo session numbers must be consecutive and start at 1.")
        for index, raw in enumerate(rows):
            attempts = int(raw["attempt_count"])
            mistakes = int(raw["mistake_count"])
            mistake_rate = min(1.0, max(0.0, mistakes / attempts)) if attempts else 0.0
            on_task_ratio = min(1.0, max(0.0, float(raw["on_task_ratio"])))
            previous = rows[index - 1] if index else None
            window = rows[max(0, index - 2):index + 1]

            item = {
                "student_code": code,
                "session_number": int(raw["session_number"]),
                "gesture_accuracy": float(raw["gesture_accuracy"]),
                "attention_score": float(raw["attention_score"]),
                "response_time": float(raw["response_time"]),
                "mistake_rate": mistake_rate,
                "looking_away_count": int(raw["looking_away_count"]),
                "on_task_ratio": on_task_ratio,
                "completion_rate": float(raw["completion_rate"]),
                "attempt_count": attempts,
                "accuracy_change": float(raw["gesture_accuracy"]) - float(previous["gesture_accuracy"]) if previous else 0.0,
                "attention_change": float(raw["attention_score"]) - float(previous["attention_score"]) if previous else 0.0,
                "response_time_change": float(raw["response_time"]) - float(previous["response_time"]) if previous else 0.0,
                "accuracy_rolling_3": sum(float(row["gesture_accuracy"]) for row in window) / len(window),
                "attention_rolling_3": sum(float(row["attention_score"]) for row in window) / len(window),
                "response_time_rolling_3": sum(float(row["response_time"]) for row in window) / len(window),
                "data_source": "synthetic",
            }
            if tuple(name for name in FEATURES if name in item) != FEATURES:
                raise ValueError("Seeded feature order does not match the model contract.")
            sessions.append(item)

    return students, sessions


def _same_value(expected: Any, actual: Any) -> bool:
    if isinstance(expected, (int, float)) and not isinstance(expected, bool):
        try:
            return math.isclose(float(expected), float(actual), rel_tol=1e-9, abs_tol=1e-9)
        except (TypeError, ValueError):
            return False
    return expected == actual


def plan_sync(
    expected_students: Sequence[Mapping[str, Any]],
    expected_sessions: Sequence[Mapping[str, Any]],
    existing_students: Mapping[str, Mapping[str, Any]],
    existing_sessions: Mapping[tuple[str, int], Mapping[str, Any]],
) -> SyncPlan:
    conflicts: list[str] = []
    missing_students: list[dict[str, Any]] = []
    missing_sessions: list[dict[str, Any]] = []

    for expected in expected_students:
        code = str(expected["student_code"]).upper()
        current = existing_students.get(code)
        if current is None:
            missing_students.append(dict(expected))
            continue
        if str(current.get("data_source", "")).lower() != "synthetic":
            conflicts.append(f"{code}: existing student is not synthetic")
            continue
        for key in ("email", "full_name", "grade"):
            old = current.get(key)
            expected_value = expected.get(key)
            if old is None and expected_value is not None:
                conflicts.append(f"{code}: existing {key} is missing; left unchanged")
            elif old is not None and not _same_value(expected_value, old):
                conflicts.append(f"{code}: existing {key} differs; left unchanged")

    for expected in expected_sessions:
        key = (str(expected["student_code"]).upper(), int(expected["session_number"]))
        current = existing_sessions.get(key)
        if current is None:
            missing_sessions.append(dict(expected))
            continue
        if str(current.get("data_source", "")).lower() != "synthetic":
            conflicts.append(f"{key[0]} session {key[1]}: existing session is not synthetic")
            continue
        for column in FEATURES:
            if not _same_value(expected[column], current.get(column)):
                conflicts.append(f"{key[0]} session {key[1]}: {column} differs; left unchanged")

    return SyncPlan(tuple(missing_students), tuple(missing_sessions), tuple(conflicts))