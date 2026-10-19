# OmniSign SL Component 03 ML API

Separate FastAPI service for the existing Linear Regression artifact. It loads the checked-in model and metadata, validates the exact 14-feature order at startup, authenticates only synthetic demo students ST001–ST005 with an opaque HttpOnly server-side session, and reads synthetic analytics through a dedicated least-privilege database role.

The model was trained on synthetic data. Its metadata explicitly says real-world validation has not been performed. The API does not write predictions.

## Local setup

1. Create a Python virtual environment and install requirements.txt.
2. Copy .env.example to .env and set ML_DATABASE_URL to a dedicated omnisign_ml_reader connection. Set DEMO_STUDENT_PASSWORD to the existing local demo password. Keep .env private.
3. Start the API from this directory with: uvicorn app.main:app --reload --port 8000
4. Start the existing Vite app in frontend/. vite.config.ts proxies /api to the local API.
5. The Vite proxy keeps cookies same-origin in development. In deployment, route /api to this service through the same-site HTTPS origin and set COOKIE_SECURE=true.

The service starts without a database URL for model and health checks, but login/dashboard requests return a generic unavailable response until a reader connection is configured. It does not accept a student ID as proof of identity. Login checks the allowlist, configured password, database email, and data_source='synthetic'; subsequent requests use the server-side cookie session.

The in-memory session store is intended for the local demo and a single API process. Restarting the API invalidates sessions. Do not run multiple workers until a shared server-side session store is added.

## Database safety

No SQL is applied automatically. sql/review_before_apply.sql is a proposal for manual review. The latest privilege output showed broad effective privileges for anon, authenticated, service_role, and postgres; the earlier RLS inspection showed RLS enabled with no policies. The SQL separates a read-only runtime role from a seed-only insert role, scopes both to synthetic ST001–ST005 rows, revokes direct browser-role table privileges, and does not grant prediction table access.

Review role memberships and effective grants before applying anything. The API must use omnisign_ml_reader, never service_role or postgres. A database URL for omnisign_ml_seed is only needed when a human explicitly runs the sync utility with --apply.

## Safe seed/sync

Running python seed_demo_data.py performs a dry run. It reports missing rows and conflicts without writing. Only python seed_demo_data.py --apply inserts missing synthetic students/sessions; it never updates or deletes. It aborts before writing if an existing profile/session conflicts or is marked real, and rechecks inside the transaction. Use a separately reviewed seed-role URL in SEED_DATABASE_URL. It never writes analytics_predictions.

The fixture contains raw values for the first five sessions of ST001–ST005 from the local Component 03 synthetic workbook. Feature engineering follows the Day 14 notebook: mistake_rate = mistake_count / attempt_count (zero when attempts are zero, clipped to [0,1]); on_task_ratio is kept as a fraction and clipped to [0,1]; per-student deltas use the prior session with first-session zero; rolling means use the current and up to two preceding sessions. The UI percentage units are converted only at its data boundary.

## API behavior

- POST /api/auth/demo/login: issues a random HttpOnly cookie only after server-side verification.
- GET /api/auth/session: validates the cookie and synthetic student record.
- POST /api/auth/logout: revokes the in-memory session.
- GET /api/student/dashboard: derives the student code from the cookie, reads only synthetic rows, and returns sessions plus an on-demand next-session accuracy prediction.
- GET /api/health: model load status.

The prediction response includes raw and bounded values, artifact SHA-256 version, generation time, source session, and persisted=false. No database prediction row is created; the proposed uniqueness index must be reviewed before persistence is considered.

## Tests

Run python -m pytest from ml-api/. Tests load the actual artifact, assert feature order, exercise demo allowlisting/synthetic-only checks, verify feature formulas and fraction units, and check conflict-safe repeatable sync planning. They do not connect to Supabase or perform database writes.