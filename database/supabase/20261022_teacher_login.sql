-- Run this migration manually as the Supabase project/database owner.
-- It extends the existing auth.users-linked profiles table; it creates no account.
BEGIN;

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS teacher_id text;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.profiles'::regclass
          AND conname = 'profiles_teacher_id_format_check'
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_teacher_id_format_check
            CHECK (teacher_id IS NULL OR teacher_id ~ '^TCH[0-9]{3,}$') NOT VALID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.profiles'::regclass
          AND conname = 'profiles_teacher_id_role_check'
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_teacher_id_role_check
            CHECK (teacher_id IS NULL OR role = 'teacher') NOT VALID;
    END IF;
END $$;

ALTER TABLE public.profiles
    VALIDATE CONSTRAINT profiles_teacher_id_format_check;
ALTER TABLE public.profiles
    VALIDATE CONSTRAINT profiles_teacher_id_role_check;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_teacher_id_unique
    ON public.profiles (teacher_id)
    WHERE teacher_id IS NOT NULL;

-- The existing own-profile UPDATE policy and table grant let users change role.
-- Restrict self-service edits to full_name so an authenticated student cannot
-- promote their own profile or assign themselves a teacher ID.
REVOKE UPDATE ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
REVOKE UPDATE (id, full_name, role, created_at, teacher_id)
    ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
GRANT UPDATE (full_name) ON TABLE public.profiles TO authenticated;

COMMENT ON COLUMN public.profiles.teacher_id IS
    'Unique TCH-prefixed ID for teacher profiles; provisioned by an administrator.';

COMMIT;
