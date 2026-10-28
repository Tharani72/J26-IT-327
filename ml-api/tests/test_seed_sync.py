from pathlib import Path

from app.feature_contract import FEATURES
from app.seed_sync import build_expected_records, load_seed_payload, percentage_to_fraction, plan_sync

ROOT = Path(__file__).resolve().parents[1]


def test_ui_percentage_ratios_convert_to_database_fractions():
    assert percentage_to_fraction(81) == 0.81
    assert percentage_to_fraction(32) == 0.32
    try:
        percentage_to_fraction(101)
        assert False, "out-of-range percentage must be rejected"
    except ValueError:
        pass


def test_seed_reproduces_verified_feature_formulas_and_ratio_units():
    students, sessions = build_expected_records(load_seed_payload())
    assert {student["student_code"] for student in students} == {"ST001", "ST002", "ST003", "ST004", "ST005"}
    assert {student["student_code"]: student["email"] for student in students} == {
        "ST001": "st001@omnisign.demo",
        "ST002": "st002@omnisign.demo",
        "ST003": "st003@omnisign.demo",
        "ST004": "st004@omnisign.demo",
        "ST005": "st005@omnisign.demo",
    }
    assert len(sessions) == 25
    first = next(row for row in sessions if row["student_code"] == "ST001" and row["session_number"] == 1)
    second = next(row for row in sessions if row["student_code"] == "ST001" and row["session_number"] == 2)
    assert tuple(name for name in FEATURES if name in first) == FEATURES
    assert first["mistake_rate"] == 0
    assert first["on_task_ratio"] == 0.81
    assert second["mistake_rate"] == 3 / 5
    assert second["accuracy_change"] == second["gesture_accuracy"] - first["gesture_accuracy"]
    assert second["accuracy_rolling_3"] == (first["gesture_accuracy"] + second["gesture_accuracy"]) / 2


def test_sync_plan_is_repeatable_and_never_overwrites_real_or_conflicting_rows():
    students, sessions = build_expected_records(load_seed_payload())
    empty_plan = plan_sync(students, sessions, {}, {})
    assert len(empty_plan.missing_students) == 5
    assert len(empty_plan.missing_sessions) == 25
    current_students = {item["student_code"]: item for item in students}
    current_sessions = {
        (item["student_code"], item["session_number"]): item for item in sessions
    }
    repeated_plan = plan_sync(students, sessions, current_students, current_sessions)
    assert not repeated_plan.conflicts
    assert not repeated_plan.missing_students
    assert not repeated_plan.missing_sessions

    real_students = dict(current_students)
    real_students["ST001"] = {**real_students["ST001"], "data_source": "real"}
    real_plan = plan_sync(students, sessions, real_students, current_sessions)
    assert any("not synthetic" in item for item in real_plan.conflicts)
    assert not real_plan.missing_sessions

    missing_email = dict(current_students)
    missing_email["ST001"] = {**missing_email["ST001"], "email": None}
    email_plan = plan_sync(students, sessions, missing_email, current_sessions)
    assert any("email is missing" in item for item in email_plan.conflicts)

    changed_sessions = dict(current_sessions)
    changed_sessions[("ST001", 1)] = {
        **changed_sessions[("ST001", 1)],
        "gesture_accuracy": -1,
    }
    mismatch_plan = plan_sync(students, sessions, current_students, changed_sessions)
    assert any("gesture_accuracy differs" in item for item in mismatch_plan.conflicts)