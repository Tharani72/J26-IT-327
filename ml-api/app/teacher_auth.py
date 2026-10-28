import os
import re
from typing import Any
from urllib.parse import urlparse

import httpx


_TEACHER_ID = re.compile(r"^TCH[0-9]{3,}$")


class InvalidTeacherCredentials(Exception):
    pass


class TeacherAuthNotConfigured(Exception):
    pass


class TeacherAuthUnavailable(Exception):
    pass


def normalize_teacher_id(value: str) -> str | None:
    normalized = value.strip().upper()
    return normalized if _TEACHER_ID.fullmatch(normalized) else None


def teacher_auth_email(teacher_id: str) -> str:
    """Return the private Supabase Auth email alias used for a teacher ID."""
    normalized = normalize_teacher_id(teacher_id)
    if normalized is None:
        raise InvalidTeacherCredentials
    return f"{normalized.lower()}@omnisign.demo"


def authenticate_teacher(teacher_id: str, password: str) -> dict[str, str]:
    """Authenticate through Supabase Auth and require a matching teacher profile."""
    normalized_id = normalize_teacher_id(teacher_id)
    if normalized_id is None or not password:
        raise InvalidTeacherCredentials

    supabase_url = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
    anon_key = os.getenv("SUPABASE_ANON_KEY", "").strip()
    if not supabase_url or not anon_key:
        raise TeacherAuthNotConfigured
    parsed_url = urlparse(supabase_url)
    is_local_http = parsed_url.scheme == "http" and parsed_url.hostname in {"localhost", "127.0.0.1", "::1"}
    if not parsed_url.netloc or (parsed_url.scheme != "https" and not is_local_http):
        raise TeacherAuthNotConfigured

    headers = {"apikey": anon_key, "Content-Type": "application/json"}
    try:
        with httpx.Client(timeout=8.0) as client:
            auth_response = client.post(
                f"{supabase_url}/auth/v1/token?grant_type=password",
                headers=headers,
                json={"email": teacher_auth_email(normalized_id), "password": password},
            )
            if auth_response.status_code in (400, 401):
                raise InvalidTeacherCredentials
            if auth_response.status_code < 200 or auth_response.status_code >= 300:
                raise TeacherAuthUnavailable

            auth_payload = auth_response.json()
            user = auth_payload.get("user")
            access_token = auth_payload.get("access_token")
            user_id = user.get("id") if isinstance(user, dict) else None
            if not isinstance(access_token, str) or not isinstance(user_id, str):
                raise TeacherAuthUnavailable

            profile_response = client.get(
                f"{supabase_url}/rest/v1/profiles",
                headers={
                    "apikey": anon_key,
                    "Authorization": f"Bearer {access_token}",
                },
                params={"select": "id,teacher_id,role", "id": f"eq.{user_id}"},
            )
            if profile_response.status_code in (401, 403) or profile_response.status_code >= 500:
                raise TeacherAuthUnavailable
            if profile_response.status_code < 200 or profile_response.status_code >= 300:
                raise TeacherAuthNotConfigured

            profiles: Any = profile_response.json()
            if not isinstance(profiles, list) or len(profiles) != 1:
                raise InvalidTeacherCredentials
            profile = profiles[0]
            if (
                not isinstance(profile, dict)
                or profile.get("id") != user_id
                or profile.get("role") != "teacher"
                or profile.get("teacher_id") != normalized_id
            ):
                raise InvalidTeacherCredentials

            return {"teacher_id": normalized_id, "user_id": user_id}
    except (InvalidTeacherCredentials, TeacherAuthNotConfigured, TeacherAuthUnavailable):
        raise
    except (httpx.HTTPError, ValueError, TypeError, KeyError):
        raise TeacherAuthUnavailable from None
