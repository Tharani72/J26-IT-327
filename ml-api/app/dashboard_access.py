from typing import Mapping, Sequence

from .feature_contract import DEMO_STUDENT_CODES


class SyntheticOnlyViolation(ValueError):
    pass


def validate_synthetic_dashboard(
    student_code: str,
    student: Mapping[str, object] | None,
    sessions: Sequence[Mapping[str, object]],
) -> None:
    code = student_code.strip().upper()
    if code not in DEMO_STUDENT_CODES:
        raise SyntheticOnlyViolation("Student code is outside the demo allowlist.")
    if student is None:
        raise SyntheticOnlyViolation("Synthetic demo student was not found.")
    if str(student.get("student_code", "")).upper() != code:
        raise SyntheticOnlyViolation("Student identity does not match the server session.")
    if str(student.get("data_source", "")).lower() != "synthetic":
        raise SyntheticOnlyViolation("Only synthetic demo profiles are available.")
    for session in sessions:
        if str(session.get("student_code", "")).upper() != code:
            raise SyntheticOnlyViolation("Session student identity does not match.")
        if str(session.get("data_source", "")).lower() != "synthetic":
            raise SyntheticOnlyViolation("Only synthetic demo sessions are available.")