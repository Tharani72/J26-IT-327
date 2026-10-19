from app.dashboard_access import SyntheticOnlyViolation, validate_synthetic_dashboard
from app.demo_auth import authorize_demo_login
from app.feature_contract import DEMO_STUDENT_CODES
from app.server_sessions import DemoSessionStore


def test_only_known_synthetic_demo_student_can_authenticate():
    student = {
        "student_code": "ST001",
        "email": "student01@omnisign.demo",
        "data_source": "synthetic",
    }
    assert authorize_demo_login("ST001", student["email"], "demo-pass", "demo-pass", student)
    assert not authorize_demo_login("ST006", student["email"], "demo-pass", "demo-pass", student)
    assert not authorize_demo_login("ST001", "other@example.test", "demo-pass", "demo-pass", student)
    assert not authorize_demo_login("ST001", student["email"], "wrong", "demo-pass", student)
    assert DEMO_STUDENT_CODES == {"ST001", "ST002", "ST003", "ST004", "ST005"}


def test_real_student_rows_are_rejected_even_with_matching_credentials():
    student = {
        "student_code": "ST001",
        "email": "student01@omnisign.demo",
        "data_source": "real",
    }
    assert not authorize_demo_login("ST001", student["email"], "demo-pass", "demo-pass", student)


def test_session_store_uses_opaque_server_side_tokens():
    store = DemoSessionStore(ttl_seconds=30)
    token, session = store.create("ST001")
    assert token
    assert store.resolve(token) == session
    assert store.resolve("ST001") is None
    store.revoke(token)
    assert store.resolve(token) is None


def test_dashboard_access_rejects_real_rows_and_mismatched_codes():
    student = {"student_code": "ST001", "data_source": "synthetic"}
    synthetic_session = {"student_code": "ST001", "data_source": "synthetic"}
    validate_synthetic_dashboard("ST001", student, [synthetic_session])

    real_student = {**student, "data_source": "real"}
    try:
        validate_synthetic_dashboard("ST001", real_student, [synthetic_session])
        assert False, "real student row must be rejected"
    except SyntheticOnlyViolation:
        pass

    real_session = {**synthetic_session, "data_source": "real"}
    try:
        validate_synthetic_dashboard("ST001", student, [real_session])
        assert False, "real session row must be rejected"
    except SyntheticOnlyViolation:
        pass

    try:
        validate_synthetic_dashboard("ST006", student, [synthetic_session])
        assert False, "unknown demo code must be rejected"
    except SyntheticOnlyViolation:
        pass