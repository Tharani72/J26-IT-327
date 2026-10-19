import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response
from pydantic import BaseModel

from .database import AnalyticsRepository, DatabaseUnavailable
from .dashboard_access import SyntheticOnlyViolation, validate_synthetic_dashboard
from .demo_auth import authorize_demo_login
from .feature_contract import DEMO_STUDENT_CODES
from .model_service import ModelService
from .server_sessions import DemoSessionStore

SERVICE_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(SERVICE_ROOT / ".env")
MODEL_PATH = Path(os.getenv("MODEL_PATH", str(SERVICE_ROOT / "artifacts" / "Day14_10000_Linear_Regression.joblib")))
METADATA_PATH = Path(os.getenv("MODEL_METADATA_PATH", str(SERVICE_ROOT / "artifacts" / "Day14_10000_Model_Metadata.json")))
COOKIE_NAME = "omnisign_demo_session"
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").strip().lower() == "true"
SESSION_TTL = int(os.getenv("SESSION_TTL_SECONDS", "28800"))


class DemoLoginPayload(BaseModel):
    studentId: str
    email: str
    password: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.model_service = ModelService.load(MODEL_PATH, METADATA_PATH)
    app.state.session_store = DemoSessionStore(SESSION_TTL)
    yield


app = FastAPI(title="OmniSign SL Component 03 ML API", version="0.1.0", lifespan=lifespan)


def repository() -> AnalyticsRepository:
    return AnalyticsRepository("ML_DATABASE_URL")


def _require_session(request: Request):
    token = request.cookies.get(COOKIE_NAME)
    session = request.app.state.session_store.resolve(token)
    if session is None or session.student_code not in DEMO_STUDENT_CODES:
        raise HTTPException(status_code=401, detail={"code": "UNAUTHENTICATED"})
    return token, session


@app.get("/api/health")
def health(request: Request):
    model: ModelService | None = getattr(request.app.state, "model_service", None)
    return {"status": "ok", "modelLoaded": model is not None}


@app.post("/api/auth/demo/login")
def demo_login(payload: DemoLoginPayload, response: Response, request: Request):
    configured_password = os.getenv("DEMO_STUDENT_PASSWORD")
    if not configured_password:
        raise HTTPException(status_code=503, detail={"code": "AUTH_NOT_CONFIGURED"})
    code = payload.studentId.strip().upper()
    if code not in DEMO_STUDENT_CODES:
        raise HTTPException(status_code=401, detail={"code": "INVALID_CREDENTIALS"})
    try:
        student = repository().get_synthetic_student(code)
    except DatabaseUnavailable:
        raise HTTPException(status_code=503, detail={"code": "DATA_UNAVAILABLE"}) from None
    if not authorize_demo_login(code, payload.email, payload.password, configured_password, student):
        raise HTTPException(status_code=401, detail={"code": "INVALID_CREDENTIALS"})

    token, _ = request.app.state.session_store.create(code)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=SESSION_TTL,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        path="/api",
    )
    return {"role": "student", "studentId": code}


@app.get("/api/auth/session")
def current_session(request: Request):
    token, session = _require_session(request)
    try:
        student = repository().get_synthetic_student(session.student_code)
    except DatabaseUnavailable:
        raise HTTPException(status_code=503, detail={"code": "DATA_UNAVAILABLE"}) from None
    if not student:
        request.app.state.session_store.revoke(token)
        raise HTTPException(status_code=401, detail={"code": "UNAUTHENTICATED"})
    return {"role": "student", "studentId": session.student_code}


@app.post("/api/auth/logout")
def logout(request: Request, response: Response):
    token = request.cookies.get(COOKIE_NAME)
    request.app.state.session_store.revoke(token)
    response.delete_cookie(key=COOKIE_NAME, path="/api", httponly=True, secure=COOKIE_SECURE, samesite="lax")
    return {"ok": True}


@app.get("/api/student/dashboard")
def student_dashboard(request: Request):
    _, session = _require_session(request)
    try:
        student, sessions = repository().get_synthetic_dashboard(session.student_code)
    except DatabaseUnavailable:
        raise HTTPException(status_code=503, detail={"code": "DATA_UNAVAILABLE"}) from None
    if not student or student.get("data_source") != "synthetic":
        raise HTTPException(status_code=404, detail={"code": "DEMO_STUDENT_NOT_FOUND"})
    try:
        validate_synthetic_dashboard(session.student_code, student, sessions)
    except SyntheticOnlyViolation:
        raise HTTPException(status_code=403, detail={"code": "SYNTHETIC_ONLY"}) from None
    if not sessions:
        raise HTTPException(status_code=404, detail={"code": "NO_SYNTHETIC_SESSIONS"})

    model: ModelService = request.app.state.model_service
    latest = sessions[-1]
    result = model.predict(latest)
    prediction = {
        "value": result.value,
        "rawValue": result.raw_value,
        "wasClipped": result.was_clipped,
        "modelName": model.metadata["model_name"],
        "modelVersion": model.model_version,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "realWorldValidation": model.metadata.get("real_world_validation", "Not yet performed"),
        "sourceSessionNumber": latest["session_number"],
        "persisted": False,
    }

    for item in sessions:
        recorded_at = item.get("recorded_at")
        item["recorded_at"] = recorded_at.isoformat() if recorded_at else None

    return {
        "student": {
            "studentCode": student["student_code"],
            "fullName": student["full_name"],
            "email": student.get("email"),
            "grade": student.get("grade"),
        },
        "sessions": sessions,
        "prediction": prediction,
    }