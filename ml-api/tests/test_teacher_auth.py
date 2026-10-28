import pytest
from fastapi.testclient import TestClient

from app import main
from app.teacher_auth import (
    InvalidTeacherCredentials,
    TeacherAuthNotConfigured,
    authenticate_teacher,
    normalize_teacher_id,
    teacher_auth_email,
)


class FakeResponse:
    def __init__(self, status_code, payload):
        self.status_code = status_code
        self.payload = payload

    def json(self):
        return self.payload


class FakeSupabaseClient:
    def __init__(self, auth_response=None, profile_response=None):
        self.auth_response = auth_response or FakeResponse(
            200,
            {"access_token": "test-access-token", "user": {"id": "user-123"}},
        )
        self.profile_response = profile_response or FakeResponse(
            200,
            [{"id": "user-123", "teacher_id": "TCH001", "role": "teacher"}],
        )
        self.auth_request = None
        self.profile_request = None

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def post(self, url, **kwargs):
        self.auth_request = (url, kwargs)
        return self.auth_response

    def get(self, url, **kwargs):
        self.profile_request = (url, kwargs)
        return self.profile_response


def test_teacher_id_normalization_and_private_auth_alias():
    assert normalize_teacher_id(" tch001 ") == "TCH001"
    assert normalize_teacher_id("ST001") is None
    assert normalize_teacher_id("TCH01") is None
    assert teacher_auth_email("TCH001") == "tch001@omnisign.demo"


def test_teacher_auth_checks_supabase_password_and_matching_profile(monkeypatch):
    client = FakeSupabaseClient()
    monkeypatch.setenv("SUPABASE_URL", "https://project.example.test/")
    monkeypatch.setenv("SUPABASE_ANON_KEY", "test-public-key")
    monkeypatch.setattr("app.teacher_auth.httpx.Client", lambda **_kwargs: client)

    result = authenticate_teacher("TCH001", "user-entered-password")

    assert result == {"teacher_id": "TCH001", "user_id": "user-123"}
    auth_url, auth_kwargs = client.auth_request
    assert auth_url == "https://project.example.test/auth/v1/token?grant_type=password"
    assert auth_kwargs["json"] == {
        "email": "tch001@omnisign.demo",
        "password": "user-entered-password",
    }
    assert auth_kwargs["headers"]["apikey"] == "test-public-key"
    profile_url, profile_kwargs = client.profile_request
    assert profile_url == "https://project.example.test/rest/v1/profiles"
    assert profile_kwargs["params"]["id"] == "eq.user-123"
    assert profile_kwargs["headers"]["Authorization"] == "Bearer test-access-token"


@pytest.mark.parametrize(
    "profile",
    [
        {"id": "user-123", "teacher_id": "TCH001", "role": "student"},
        {"id": "user-123", "teacher_id": "TCH002", "role": "teacher"},
        {"id": "another-user", "teacher_id": "TCH001", "role": "teacher"},
        [],
    ],
)
def test_teacher_auth_rejects_profiles_that_are_not_the_matching_teacher(monkeypatch, profile):
    client = FakeSupabaseClient(profile_response=FakeResponse(200, [profile]))
    monkeypatch.setenv("SUPABASE_URL", "https://project.example.test")
    monkeypatch.setenv("SUPABASE_ANON_KEY", "test-public-key")
    monkeypatch.setattr("app.teacher_auth.httpx.Client", lambda **_kwargs: client)

    with pytest.raises(InvalidTeacherCredentials):
        authenticate_teacher("TCH001", "user-entered-password")


def test_teacher_auth_rejects_bad_password_and_fails_closed_without_configuration(monkeypatch):
    client = FakeSupabaseClient(auth_response=FakeResponse(400, {"error": "invalid login"}))
    monkeypatch.setenv("SUPABASE_URL", "https://project.example.test")
    monkeypatch.setenv("SUPABASE_ANON_KEY", "test-public-key")
    monkeypatch.setattr("app.teacher_auth.httpx.Client", lambda **_kwargs: client)
    with pytest.raises(InvalidTeacherCredentials):
        authenticate_teacher("TCH001", "wrong-password")

    monkeypatch.delenv("SUPABASE_ANON_KEY")
    with pytest.raises(TeacherAuthNotConfigured):
        authenticate_teacher("TCH001", "user-entered-password")


def test_teacher_login_sets_httponly_session_that_survives_refresh_and_logout(monkeypatch):
    monkeypatch.setattr(
        main,
        "authenticate_teacher",
        lambda teacher_id, password: {"teacher_id": teacher_id, "user_id": "user-123"},
    )
    with TestClient(main.app) as client:
        assert client.get("/api/auth/session").status_code == 401

        login = client.post(
            "/api/auth/teacher/login",
            json={"teacherId": "tch001", "password": "test-only-password"},
        )
        assert login.status_code == 200
        assert login.json() == {"role": "teacher", "teacherId": "TCH001"}
        assert "httponly" in login.headers["set-cookie"].lower()
        assert client.get("/api/auth/session").json() == {"role": "teacher", "teacherId": "TCH001"}
        assert client.get("/api/auth/session").json() == {"role": "teacher", "teacherId": "TCH001"}

        assert client.post("/api/auth/logout").json() == {"ok": True}
        assert client.get("/api/auth/session").status_code == 401


def test_teacher_login_rejects_student_ids_and_invalid_credentials(monkeypatch):
    def reject_password(_teacher_id, _password):
        raise InvalidTeacherCredentials

    monkeypatch.setattr(main, "authenticate_teacher", reject_password)
    with TestClient(main.app) as client:
        student_id = client.post(
            "/api/auth/teacher/login",
            json={"teacherId": "ST001", "password": "any-password"},
        )
        assert student_id.status_code == 401
        assert student_id.json()["detail"]["code"] == "INVALID_CREDENTIALS"

        bad_password = client.post(
            "/api/auth/teacher/login",
            json={"teacherId": "TCH001", "password": "wrong-password"},
        )
        assert bad_password.status_code == 401
        assert bad_password.json()["detail"]["code"] == "INVALID_CREDENTIALS"

        unknown_teacher = client.post(
            "/api/auth/teacher/login",
            json={"teacherId": "TCH999", "password": "any-password"},
        )
        assert unknown_teacher.status_code == 401
        assert unknown_teacher.json()["detail"]["code"] == "INVALID_CREDENTIALS"


def test_student_session_is_not_returned_as_teacher(monkeypatch):
    monkeypatch.setenv("DEMO_STUDENT_PASSWORD", "test-only-student-password")
    class Repository:
        def get_synthetic_student(self, student_code):
            return {
                "student_code": student_code,
                "email": "st001@omnisign.demo",
                "data_source": "synthetic",
            }

    monkeypatch.setattr(main, "repository", lambda: Repository())
    with TestClient(main.app) as client:
        login = client.post(
            "/api/auth/demo/login",
            json={
                "studentId": "ST001",
                "email": "st001@omnisign.demo",
                "password": "test-only-student-password",
            },
        )
        assert login.status_code == 200
        assert client.get("/api/auth/session").json() == {"role": "student", "studentId": "ST001"}
