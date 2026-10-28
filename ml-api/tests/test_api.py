from datetime import datetime, timezone
from pathlib import Path

from fastapi.testclient import TestClient

from app import main
from app.seed_sync import build_expected_records, load_seed_payload

ROOT = Path(__file__).resolve().parents[1]


class FakeRepository:
    def __init__(self, session_source="synthetic"):
        students, rows = build_expected_records(load_seed_payload())
        self.student = {
            **students[0],
            "student_code": "ST001",
            "data_source": "synthetic",
        }
        self.rows = [
            {
                **row,
                "id": "session-" + str(row["session_number"]),
                "recorded_at": datetime(2026, 10, row["session_number"], tzinfo=timezone.utc),
                "data_source": session_source,
            }
            for row in rows
            if row["student_code"] == "ST001"
        ]

    def get_synthetic_student(self, code):
        return self.student if code == "ST001" else None

    def get_synthetic_dashboard(self, code):
        return (self.student, self.rows) if code == "ST001" else (None, [])


def test_api_uses_cookie_session_and_returns_unpersisted_model_prediction(monkeypatch):
    monkeypatch.setenv("DEMO_STUDENT_PASSWORD", "test-only-demo-password")
    monkeypatch.setattr(main, "repository", lambda: FakeRepository())
    with TestClient(main.app) as client:
        unauthenticated = client.get("/api/student/dashboard?studentId=ST001")
        assert unauthenticated.status_code == 401

        login = client.post(
            "/api/auth/demo/login",
            json={
                "studentId": "ST001",
                "email": "st001@omnisign.demo",
                "password": "test-only-demo-password",
            },
        )
        assert login.status_code == 200
        assert "httponly" in login.headers["set-cookie"].lower()
        assert client.get("/api/auth/session").json()["studentId"] == "ST001"

        dashboard = client.get("/api/student/dashboard")
        assert dashboard.status_code == 200
        payload = dashboard.json()
        assert len(payload["sessions"]) == 5
        assert payload["prediction"]["modelVersion"]
        assert payload["prediction"]["persisted"] is False
        assert payload["prediction"]["sourceSessionNumber"] == 5


def test_api_rejects_real_session_rows(monkeypatch):
    monkeypatch.setenv("DEMO_STUDENT_PASSWORD", "test-only-demo-password")
    monkeypatch.setattr(main, "repository", lambda: FakeRepository(session_source="real"))
    with TestClient(main.app) as client:
        login = client.post(
            "/api/auth/demo/login",
            json={
                "studentId": "ST001",
                "email": "st001@omnisign.demo",
                "password": "test-only-demo-password",
            },
        )
        assert login.status_code == 200
        assert client.get("/api/student/dashboard").status_code == 403