import os
from typing import Any

from .feature_contract import DEMO_STUDENT_CODES, FEATURES


class DatabaseUnavailable(RuntimeError):
    pass


class AnalyticsRepository:
    def __init__(self, environment_variable: str = "ML_DATABASE_URL"):
        self.environment_variable = environment_variable

    def _connect(self):
        dsn = os.getenv(self.environment_variable, "").strip()
        if not dsn:
            raise DatabaseUnavailable("Database connection is not configured.")
        try:
            import psycopg
            from psycopg.rows import dict_row

            return psycopg.connect(dsn, row_factory=dict_row)
        except Exception:
            # Keep connection details and secrets out of API responses and logs.
            raise DatabaseUnavailable("Database connection is unavailable.") from None

    def get_synthetic_student(self, student_code: str) -> dict[str, Any] | None:
        code = student_code.strip().upper()
        if code not in DEMO_STUDENT_CODES:
            return None
        try:
            with self._connect() as connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        SELECT student_code, full_name, email, grade, data_source
                        FROM public.analytics_students
                        WHERE student_code = %s
                          AND data_source = 'synthetic'
                        """,
                        (code,),
                    )
                    row = cursor.fetchone()
                    return dict(row) if row else None
        except DatabaseUnavailable:
            raise
        except Exception:
            raise DatabaseUnavailable("Synthetic student lookup failed.") from None

    def get_synthetic_dashboard(self, student_code: str) -> tuple[dict[str, Any] | None, list[dict[str, Any]]]:
        code = student_code.strip().upper()
        if code not in DEMO_STUDENT_CODES:
            return None, []
        columns = ", ".join(f"s.{name}" for name in FEATURES)
        try:
            with self._connect() as connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        SELECT st.student_code, st.full_name, st.email, st.grade, st.data_source
                        FROM public.analytics_students AS st
                        WHERE st.student_code = %s
                          AND st.data_source = 'synthetic'
                        """,
                        (code,),
                    )
                    student = cursor.fetchone()
                    if not student:
                        return None, []

                    cursor.execute(
                        f"""
                        SELECT s.id::text AS id, s.student_code, s.session_number,
                               s.recorded_at, s.data_source, {columns}
                        FROM public.analytics_sessions AS s
                        JOIN public.analytics_students AS st
                          ON st.student_code = s.student_code
                        WHERE s.student_code = %s
                          AND s.data_source = 'synthetic'
                          AND st.data_source = 'synthetic'
                        ORDER BY s.session_number ASC
                        """,
                        (code,),
                    )
                    sessions = [dict(row) for row in cursor.fetchall()]
                    if any(row.get("data_source") != "synthetic" for row in sessions):
                        raise DatabaseUnavailable("Synthetic-only data boundary was violated.")
                    return dict(student), sessions
        except DatabaseUnavailable:
            raise
        except Exception:
            raise DatabaseUnavailable("Synthetic dashboard lookup failed.") from None
    def check_read_only(self) -> int:
        """Verify the dedicated reader connection with read-only queries only."""
        try:
            with self._connect() as connection:
                with connection.cursor() as cursor:
                    cursor.execute("SET TRANSACTION READ ONLY")
                    cursor.execute("SELECT 1 AS ok, current_user AS role")
                    identity = cursor.fetchone()
                    if not identity or int(identity["ok"]) != 1:
                        raise DatabaseUnavailable("Read-only connectivity query failed.")
                    if identity["role"] != "omnisign_ml_reader":
                        raise DatabaseUnavailable("Configured database role is not the dedicated reader role.")

                    cursor.execute(
                        """
                        SELECT count(*)::int AS visible_demo_students
                        FROM public.analytics_students
                        WHERE student_code = ANY(%s)
                          AND data_source = 'synthetic'
                        """,
                        (sorted(DEMO_STUDENT_CODES),),
                    )
                    result = cursor.fetchone()
                    if result is None:
                        raise DatabaseUnavailable("Synthetic demo count query returned no result.")
                    return int(result["visible_demo_students"])
        except DatabaseUnavailable:
            raise
        except Exception:
            raise DatabaseUnavailable("Read-only database connectivity check failed.") from None