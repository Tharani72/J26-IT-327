"""Run a redacted, read-only connectivity check using ML_DATABASE_URL."""

from pathlib import Path

from dotenv import load_dotenv

from .database import AnalyticsRepository, DatabaseUnavailable

SERVICE_ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    load_dotenv(SERVICE_ROOT / ".env")
    try:
        visible_count = AnalyticsRepository("ML_DATABASE_URL").check_read_only()
    except DatabaseUnavailable:
        print(
            "Database connectivity check failed. Verify ML_DATABASE_URL uses "
            "the dedicated reader role and that its read permissions are configured. "
            "Connection details were redacted."
        )
        return 1

    print("Database connection verified; SELECT 1 succeeded as omnisign_ml_reader.")
    print(f"Visible synthetic demo student count (ST001-ST005): {visible_count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())