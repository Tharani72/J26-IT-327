import hmac
from typing import Mapping

from .feature_contract import DEMO_STUDENT_CODES


def authorize_demo_login(
    student_code: str,
    email: str,
    password: str,
    configured_password: str | None,
    database_student: Mapping[str, object] | None,
) -> bool:
    code = student_code.strip().upper()
    normalized_email = email.strip().lower()
    if not configured_password or code not in DEMO_STUDENT_CODES or database_student is None:
        return False

    if str(database_student.get("data_source", "")).lower() != "synthetic":
        return False
    if str(database_student.get("student_code", "")).upper() != code:
        return False
    stored_email = str(database_student.get("email") or "").strip().lower()
    if not stored_email or not hmac.compare_digest(stored_email, normalized_email):
        return False
    return hmac.compare_digest(configured_password, password)