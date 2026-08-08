/*
# MedFluent — profiles, reports tables and storage bucket

1. New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text)
  - `age` (integer, optional)
  - `preferred_language` (text, default 'English')
  - `created_at` (timestamptz)
- `reports`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users with cascade delete)
  - `original_text` (text, not null)
  - `ai_response` (text, nullable — populated after AI analysis)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on both `profiles` and `reports`.
- `profiles`: owner-scoped CRUD (each user manages only their own profile row, id == auth.uid()).
- `reports`: owner-scoped CRUD (each user accesses only rows where user_id == auth.uid()).
- All policies scoped TO authenticated.

3. Storage
- Create a private storage bucket `reports` for user-uploaded medical documents.
- Storage policies allow authenticated users to manage only their own files (path prefix = their user id).

4. Important Notes
- `reports.user_id` has DEFAULT auth.uid() so client inserts omitting user_id still pass the INSERT WITH CHECK.
- Policies are dropped before (re)created to keep the migration idempotent.
*/

-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  age integer,
  preferred_language text NOT NULL DEFAULT 'English',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  original_text text NOT NULL,
  ai_response text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_reports" ON reports;
CREATE POLICY "select_own_reports" ON reports FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_reports" ON reports;
CREATE POLICY "insert_own_reports" ON reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_reports" ON reports;
CREATE POLICY "update_own_reports" ON reports FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_reports" ON reports;
CREATE POLICY "delete_own_reports" ON reports FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- index for common query: list reports by user, newest first
CREATE INDEX IF NOT EXISTS reports_user_id_created_at_idx ON reports (user_id, created_at DESC);

-- Storage bucket for uploaded documents (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users manage only files under their own user id prefix
DROP POLICY IF EXISTS "Users can view own report files" ON storage.objects;
CREATE POLICY "Users can view own report files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'reports' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can upload own report files" ON storage.objects;
CREATE POLICY "Users can upload own report files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'reports' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own report files" ON storage.objects;
CREATE POLICY "Users can update own report files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'reports' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'reports' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own report files" ON storage.objects;
CREATE POLICY "Users can delete own report files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'reports' AND (storage.foldername(name))[1] = auth.uid()::text);
