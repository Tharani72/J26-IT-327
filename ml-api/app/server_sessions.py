import secrets
import threading
import time
from dataclasses import dataclass


@dataclass(frozen=True)
class DemoSession:
    student_code: str
    expires_at: float


class DemoSessionStore:
    """Opaque, in-memory demo sessions; a browser ID alone is never an identity."""

    def __init__(self, ttl_seconds: int = 28800):
        self.ttl_seconds = ttl_seconds
        self._items: dict[str, DemoSession] = {}
        self._lock = threading.Lock()

    def create(self, student_code: str) -> tuple[str, DemoSession]:
        token = secrets.token_urlsafe(32)
        session = DemoSession(student_code=student_code, expires_at=time.time() + self.ttl_seconds)
        with self._lock:
            self._items[token] = session
        return token, session

    def resolve(self, token: str | None) -> DemoSession | None:
        if not token:
            return None
        now = time.time()
        with self._lock:
            session = self._items.get(token)
            if session is None:
                return None
            if session.expires_at <= now:
                self._items.pop(token, None)
                return None
            return session

    def revoke(self, token: str | None) -> None:
        if token:
            with self._lock:
                self._items.pop(token, None)