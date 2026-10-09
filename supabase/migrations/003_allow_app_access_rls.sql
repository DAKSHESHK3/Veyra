-- ==============================================================================
-- 003_ALLOW_APP_ACCESS_RLS.SQL
-- Updates Row Level Security (RLS) to permit the Veyra web app (anon & auth)
-- to read/insert students, face embeddings, subjects, and attendance records
-- ==============================================================================

-- 1. STUDENTS
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can read students" ON public.students;
DROP POLICY IF EXISTS "Allow public read students" ON public.students;
DROP POLICY IF EXISTS "Allow public write students" ON public.students;

CREATE POLICY "Allow public read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public write students" ON public.students FOR ALL USING (true) WITH CHECK (true);

-- 2. SUBJECTS
DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
DROP POLICY IF EXISTS "Authenticated users can read subjects" ON public.subjects;
DROP POLICY IF EXISTS "Allow public read subjects" ON public.subjects;
DROP POLICY IF EXISTS "Allow public write subjects" ON public.subjects;

CREATE POLICY "Allow public read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow public write subjects" ON public.subjects FOR ALL USING (true) WITH CHECK (true);

-- 3. FACE EMBEDDINGS
DROP POLICY IF EXISTS "Admins can manage embeddings" ON public.face_embeddings;
DROP POLICY IF EXISTS "Authenticated users can read embeddings" ON public.face_embeddings;
DROP POLICY IF EXISTS "Allow public read embeddings" ON public.face_embeddings;
DROP POLICY IF EXISTS "Allow public write embeddings" ON public.face_embeddings;

CREATE POLICY "Allow public read embeddings" ON public.face_embeddings FOR SELECT USING (true);
CREATE POLICY "Allow public write embeddings" ON public.face_embeddings FOR ALL USING (true) WITH CHECK (true);

-- 4. ATTENDANCE SESSIONS
DROP POLICY IF EXISTS "Teachers and Admins can create attendance sessions" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Teachers and Admins can update attendance sessions" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Authenticated users can read attendance sessions" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Allow public read sessions" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Allow public write sessions" ON public.attendance_sessions;

CREATE POLICY "Allow public read sessions" ON public.attendance_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public write sessions" ON public.attendance_sessions FOR ALL USING (true) WITH CHECK (true);

-- 5. ATTENDANCE RECORDS
DROP POLICY IF EXISTS "Teachers and Admins can insert attendance records" ON public.attendance_records;
DROP POLICY IF EXISTS "Teachers and Admins can update attendance records" ON public.attendance_records;
DROP POLICY IF EXISTS "Authenticated users can read attendance records" ON public.attendance_records;
DROP POLICY IF EXISTS "Allow public read records" ON public.attendance_records;
DROP POLICY IF EXISTS "Allow public write records" ON public.attendance_records;

CREATE POLICY "Allow public read records" ON public.attendance_records FOR SELECT USING (true);
CREATE POLICY "Allow public write records" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);
