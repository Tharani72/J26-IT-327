import argparse
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

SERVICE_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(SERVICE_ROOT))

from app.feature_contract import FEATURES
from app.seed_sync import build_expected_records, load_seed_payload, plan_sync

class SyncConflict(RuntimeError):
    pass


STUDENT_COLUMNS = ("student_code", "full_name", "email", "grade", "data_source")
SESSION_COLUMNS = ("student_code", "session_number", *FEATURES, "data_source")


def fetch_current(connection, codes: list[str]):
    from psycopg.rows import dict_row

    with connection.cursor(row_factory=dict_row) as cursor:
        cursor.execute(
            """
            SELECT student_code, full_name, email, grade, data_source
            FROM public.analytics_students
            WHERE student_code = ANY(%s)
            """,
            (codes,),
        )
        students = {row["student_code"]: dict(row) for row in cursor.fetchall()}
        columns = ", ".join(SESSION_COLUMNS)
        cursor.execute(
            f"""
            SELECT {columns}
            FROM public.analytics_sessions
            WHERE student_code = ANY(%s)
            ORDER BY student_code, session_number
            """,
            (codes,),
        )
        sessions = {
            (row["student_code"], int(row["session_number"])): dict(row)
            for row in cursor.fetchall()
        }
    return students, sessions


def run(apply: bool) -> int:
    load_dotenv(SERVICE_ROOT / ".env")
    dsn = os.getenv("SEED_DATABASE_URL", "").strip()
    if not dsn:
        print("SEED_DATABASE_URL is not configured; no database connection was opened.")
        return 2

    try:
        import psycopg

        payload = load_seed_payload()
        expected_students, expected_sessions = build_expected_records(payload)
        codes = sorted(student["student_code"] for student in expected_students)
        with psycopg.connect(dsn, autocommit=True) as connection:
            current_students, current_sessions = fetch_current(connection, codes)
            plan = plan_sync(expected_students, expected_sessions, current_students, current_sessions)
            if plan.conflicts:
                for conflict in plan.conflicts:
                    print("CONFLICT:", conflict)
                print("No records were written.")
                return 2

            print(f"Students to insert: {len(plan.missing_students)}")
            print(f"Synthetic sessions to insert: {len(plan.missing_sessions)}")
            if not apply:
                print("Dry run only. Re-run with --apply after reviewing these results.")
                return 0
            if not plan.missing_students and not plan.missing_sessions:
                print("Already synchronized; no changes needed.")
                return 0

            with connection.transaction():
                with connection.cursor() as cursor:
                    for student in plan.missing_students:
                        cursor.execute(
                            """
                            INSERT INTO public.analytics_students
                                (student_code, full_name, email, grade, data_source)
                            VALUES (%s, %s, %s, %s, 'synthetic')
                            ON CONFLICT (student_code) DO NOTHING
                            """,
                            (student["student_code"], student["full_name"], student["email"], student["grade"]),
                        )
                    for session in plan.missing_sessions:
                        names = ", ".join(SESSION_COLUMNS)
                        placeholders = ", ".join(["%s"] * len(SESSION_COLUMNS))
                        values = [session[name] for name in SESSION_COLUMNS]
                        cursor.execute(
                            f"""
                            INSERT INTO public.analytics_sessions ({names})
                            VALUES ({placeholders})
                            ON CONFLICT (student_code, session_number) DO NOTHING
                            """,
                            values,
                        )

                final_students, final_sessions = fetch_current(connection, codes)
                final_plan = plan_sync(expected_students, expected_sessions, final_students, final_sessions)
                if final_plan.conflicts or final_plan.missing_students or final_plan.missing_sessions:
                    details = "; ".join(final_plan.conflicts) or "one or more expected synthetic rows remain missing"
                    raise SyncConflict(f"Post-insert conflict or RLS-hidden row: {details}")

            print("Synthetic demo sync completed; existing records were reused and never updated or deleted.")
            return 0
    except Exception:
        print("Sync failed safely. No credentials or database error details were printed.")
        return 2


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Safely sync only ST001–ST005 synthetic demo records.")
    parser.add_argument("--apply", action="store_true", help="Insert missing synthetic rows after conflict checks.")
    raise SystemExit(run(parser.parse_args().apply))