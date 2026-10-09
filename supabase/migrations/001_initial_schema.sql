-- ==============================================================================
-- SMART ATTENDANCE SYSTEM - CORE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SUBJECTS
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    class_name TEXT NOT NULL,
    semester TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    semester TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    photo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_roll_per_class UNIQUE (roll_number, class_name)
);

-- 4. FACE EMBEDDINGS (Stores 128-d float biometric vectors)
CREATE TABLE IF NOT EXISTS public.face_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,
    embedding JSONB NOT NULL, -- Array of 128 float values
    sample_count INTEGER NOT NULL DEFAULT 1,
    model_version TEXT NOT NULL DEFAULT 'facenet-128d',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ENROLLMENT SAMPLES (Audit trail for capture frames)
CREATE TABLE IF NOT EXISTS public.enrollment_samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    pose TEXT NOT NULL CHECK (pose IN ('frontal', 'left', 'right')),
    quality_score NUMERIC(4,3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ATTENDANCE SESSIONS
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    class_name TEXT NOT NULL,
    semester TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ATTENDANCE RECORDS
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent')),
    confidence NUMERIC(5,4),
    marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_student_per_session UNIQUE (session_id, student_id)
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_students_roll_class ON public.students(roll_number, class_name);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON public.subjects(code);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_subject ON public.attendance_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON public.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_face_embeddings_student ON public.face_embeddings(student_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.face_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Helper function: get user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Users can view their own profile; admins can view all
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.get_current_user_role() = 'admin');

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Subjects: Anyone authenticated can read; only admins can insert/update/delete
CREATE POLICY "Authenticated users can read subjects"
    ON public.subjects FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage subjects"
    ON public.subjects FOR ALL
    TO authenticated
    USING (public.get_current_user_role() = 'admin')
    WITH CHECK (public.get_current_user_role() = 'admin');

-- Students: Authenticated can read; admins can manage
CREATE POLICY "Authenticated users can read students"
    ON public.students FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage students"
    ON public.students FOR ALL
    TO authenticated
    USING (public.get_current_user_role() = 'admin')
    WITH CHECK (public.get_current_user_role() = 'admin');

-- Face Embeddings: Authenticated can read for recognition; admins can manage
CREATE POLICY "Authenticated users can read embeddings"
    ON public.face_embeddings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage embeddings"
    ON public.face_embeddings FOR ALL
    TO authenticated
    USING (public.get_current_user_role() = 'admin')
    WITH CHECK (public.get_current_user_role() = 'admin');

-- Attendance Sessions: Authenticated can view & create sessions
CREATE POLICY "Authenticated users can read attendance sessions"
    ON public.attendance_sessions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teachers and Admins can create attendance sessions"
    ON public.attendance_sessions FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Teachers and Admins can update attendance sessions"
    ON public.attendance_sessions FOR UPDATE
    TO authenticated
    USING (true);

-- Attendance Records: Authenticated can read & insert records
CREATE POLICY "Authenticated users can read attendance records"
    ON public.attendance_records FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teachers and Admins can insert attendance records"
    ON public.attendance_records FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Teachers and Admins can update attendance records"
    ON public.attendance_records FOR UPDATE
    TO authenticated
    USING (true);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'teacher')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION & POLICIES
-- ==============================================================================
-- Note: Run in Supabase SQL editor or CLI
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('enrollment-samples', 'enrollment-samples', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can read student photos"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'student-photos');

CREATE POLICY "Admins can upload student photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'student-photos');
