-- REVIEW ONLY. This file is not executed by the application or seed script.
-- Inspect current role memberships and grants before applying. Do not use a service-role
-- or postgres connection string in the ML API or frontend.

-- The latest inspection showed direct broad grants for anon/authenticated, including
-- table operations not governed by RLS (for example TRUNCATE). Remove direct access
-- from public browser roles, then grant only the dedicated server roles below.
REVOKE ALL PRIVILEGES ON TABLE
    public.analytics_students,
    public.analytics_sessions,
    public.analytics_predictions
FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'omnisign_ml_reader') THEN
        CREATE ROLE omnisign_ml_reader LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'omnisign_ml_seed') THEN
        CREATE ROLE omnisign_ml_seed LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
    END IF;
END $$;

-- Set each role password separately using the Supabase dashboard/secret manager.
-- Do not place a password in this file or commit a DATABASE_URL.
GRANT USAGE ON SCHEMA public TO omnisign_ml_reader, omnisign_ml_seed;
GRANT SELECT ON TABLE public.analytics_students, public.analytics_sessions
    TO omnisign_ml_reader, omnisign_ml_seed;
GRANT INSERT ON TABLE public.analytics_students, public.analytics_sessions
    TO omnisign_ml_seed;
-- No runtime or seed-role grants are proposed for analytics_predictions.

CREATE POLICY analytics_students_demo_read
ON public.analytics_students FOR SELECT
TO omnisign_ml_reader, omnisign_ml_seed
USING (
    data_source = 'synthetic'
    AND student_code IN ('ST001', 'ST002', 'ST003', 'ST004', 'ST005')
);

CREATE POLICY analytics_students_demo_seed
ON public.analytics_students FOR INSERT
TO omnisign_ml_seed
WITH CHECK (
    data_source = 'synthetic'
    AND student_code IN ('ST001', 'ST002', 'ST003', 'ST004', 'ST005')
);

CREATE POLICY analytics_sessions_demo_read
ON public.analytics_sessions FOR SELECT
TO omnisign_ml_reader, omnisign_ml_seed
USING (
    data_source = 'synthetic'
    AND student_code IN ('ST001', 'ST002', 'ST003', 'ST004', 'ST005')
    AND EXISTS (
        SELECT 1
        FROM public.analytics_students AS st
        WHERE st.student_code = analytics_sessions.student_code
          AND st.data_source = 'synthetic'
          AND st.student_code IN ('ST001', 'ST002', 'ST003', 'ST004', 'ST005')
    )
);

CREATE POLICY analytics_sessions_demo_seed
ON public.analytics_sessions FOR INSERT
TO omnisign_ml_seed
WITH CHECK (
    data_source = 'synthetic'
    AND student_code IN ('ST001', 'ST002', 'ST003', 'ST004', 'ST005')
    AND EXISTS (
        SELECT 1
        FROM public.analytics_students AS st
        WHERE st.student_code = analytics_sessions.student_code
          AND st.data_source = 'synthetic'
          AND st.student_code IN ('ST001', 'ST002', 'ST003', 'ST004', 'ST005')
    )
);

-- Verify effective grants, RLS flags, and role memberships after a separately reviewed apply.
SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('analytics_students', 'analytics_sessions', 'analytics_predictions');

SELECT
    has_table_privilege('anon', 'public.analytics_students', 'SELECT') AS anon_students_select,
    has_table_privilege('anon', 'public.analytics_students', 'TRUNCATE') AS anon_students_truncate,
    has_table_privilege('authenticated', 'public.analytics_sessions', 'INSERT') AS authenticated_sessions_insert,
    has_table_privilege('omnisign_ml_reader', 'public.analytics_students', 'SELECT') AS reader_students_select,
    has_table_privilege('omnisign_ml_reader', 'public.analytics_students', 'INSERT') AS reader_students_insert,
    has_table_privilege('omnisign_ml_seed', 'public.analytics_sessions', 'INSERT') AS seed_sessions_insert,
    has_table_privilege('omnisign_ml_seed', 'public.analytics_predictions', 'INSERT') AS seed_predictions_insert;

SELECT member_role.rolname AS member, granted_role.rolname AS granted_role
FROM pg_auth_members AS membership
JOIN pg_roles AS member_role ON member_role.oid = membership.member
JOIN pg_roles AS granted_role ON granted_role.oid = membership.roleid
WHERE member_role.rolname IN ('anon', 'authenticated', 'omnisign_ml_reader', 'omnisign_ml_seed');

-- Prediction idempotency proposal: first inspect duplicates. Do NOT create this index
-- unless the query returns zero rows and the DDL is approved.
SELECT session_id, model_name, model_version, count(*) AS row_count
FROM public.analytics_predictions
WHERE model_version IS NOT NULL
GROUP BY session_id, model_name, model_version
HAVING count(*) > 1;

-- If and only if the duplicate check is empty, apply this separately after review:
-- CREATE UNIQUE INDEX ux_analytics_predictions_session_model_version
-- ON public.analytics_predictions (session_id, model_name, model_version)
-- WHERE model_version IS NOT NULL;
--
-- The API currently computes a response only. It does not insert predictions.
-- The model-version value is the SHA-256 of the loaded artifact.