-- MIGRATION SCRIPT GENERATED FROM LEGACY DATA
-- Insert default legacy subjects
INSERT INTO public.subjects (name, code, class_name, semester) VALUES
  ('English Literature', 'ENG101', 'CS-5th', '5th Semester'),
  ('Hindi Language & Comm', 'HIN101', 'CS-5th', '5th Semester')
ON CONFLICT (code) DO NOTHING;

-- Insert legacy students
INSERT INTO public.students (roll_number, full_name, class_name, semester) VALUES
  ('1', 'Kushagra', 'CS-5th', '5th Semester'),
  ('2', 'Bhavesh', 'CS-5th', '5th Semester'),
  ('3', 'Rishabh', 'CS-5th', '5th Semester')
ON CONFLICT (roll_number, class_name) DO NOTHING;
