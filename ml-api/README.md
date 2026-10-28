# OmniSign SL Component 03 ML API

Separate FastAPI service for the existing Linear Regression artifact. It loads the checked-in model and metadata, validates the exact 14-feature order at startup, authenticates only synthetic demo students ST001–ST005 with an opaque HttpOnly server-side session, and reads synthetic analytics through a dedicated least-privilege database role.

The model was trained on synthetic data. Its metadata explicitly says real-world validation has not been performed. The API does not write predictions.

## Local setup

1. Create a Python virtual environment and install requirements.txt.
2. Copy .env.example to .env and set ML_DATABASE_URL to a dedicated omnisign_ml_reader connection. Set DEMO_STUDENT_PASSWORD in your private local .env file.
3. Start the API from this directory with: uvicorn app.main:app --reload --port 8000
4. Start the existing Vite app in frontend/. vite.config.ts proxies /api to the local API.
5. The Vite proxy keeps cookies same-origin in development. In deployment, route /api to this service through the same-site HTTPS origin and set COOKIE_SECURE=true.

The service starts without a database URL for model and health checks, but login/dashboard requests return a generic unavailable response until a reader connection is configured. It does not accept a student ID as proof of identity. Login checks the allowlist, configured password, database email, and data_source='synthetic'; subsequent requests use the server-side cookie session.

The in-memory session store is intended for the local demo and a single API process. Restarting the API invalidates sessions. Do not run multiple workers until a shared server-side session store is added.

## Demo student accounts

| Student ID | Demo email |
| --- | --- |
| ST001 | st001@omnisign.demo |
| ST002 | st002@omnisign.demo |
| ST003 | st003@omnisign.demo |
| ST004 | st004@omnisign.demo |
| ST005 | st005@omnisign.demo |

## Teacher ID login

Teacher login uses Supabase Auth password verification and the existing `public.profiles` table. The login ID `TCH001` maps to the private Auth email alias `tch001@omnisign.demo`; no teacher password or account is created by this application. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the API's private `.env` file. The API uses the anon key server-side and never needs a service-role key.

Before enabling teacher login, a Supabase project owner must manually apply `../database/supabase/20261022_teacher_login.sql`. It adds a unique `teacher_id` to the existing Auth-linked profile table and removes authenticated users' ability to update their own `role` or `teacher_id`; the existing own-profile policy still permits updating `full_name`. The current ML database role is read-only and cannot apply this migration or inspect profile rows.

Create a real teacher account in Supabase Authentication with its matching alias (for example, `tch001@omnisign.demo`) and set its password privately in Supabase. Then use the Supabase Table Editor to ensure the linked `public.profiles` row has `role='teacher'` and `teacher_id='TCH001'`. If an auth trigger already created that profile row, verify the identity before editing it. Do not put passwords in SQL, source code, this repository, or the browser. The login rejects accounts whose Auth identity and profile role/ID do not match. No current teacher account could be verified from the configured read-only database connection.

The teacher session uses the same opaque HttpOnly cookie as the student demo flow. It survives a browser refresh while the single API process is running; restarting the API clears its in-memory sessions. Apply the SQL migration and configure the API URL/key before testing against a real teacher account.

## Database safety

No SQL is applied automatically. sql/review_before_apply.sql is a proposal for manual review. The latest privilege output showed broad effective privileges for anon, authenticated, service_role, and postgres; the earlier RLS inspection showed RLS enabled with no policies. The SQL separates a read-only runtime role from a seed-only insert role, scopes both to synthetic ST001–ST005 rows, revokes direct browser-role table privileges, and does not grant prediction table access.

Review role memberships and effective grants before applying anything. The API must use omnisign_ml_reader, never service_role or postgres. A database URL for omnisign_ml_seed is only needed when a human explicitly runs the sync utility with --apply.

## Safe seed/sync

Running python seed_demo_data.py performs a dry run. It reports missing rows and conflicts without writing. Only python seed_demo_data.py --apply inserts missing synthetic students/sessions; it never updates or deletes. It aborts before writing if an existing profile/session conflicts or is marked real, and rechecks inside the transaction. Use a separately reviewed seed-role URL in SEED_DATABASE_URL. It never writes analytics_predictions. Login checks the submitted email against the synthetic student row, so existing synthetic ST001–ST005 rows with the previous demo emails need an email-only update through the approved Supabase process before login. The sync utility reports the mismatch and does not update existing rows; real student rows remain out of scope.

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
