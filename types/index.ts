export type Role = "admin" | "teacher";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  roll_number: string;
  full_name: string;
  class_name: string;
  semester: string;
  email?: string;
  phone?: string;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Computed fields
  attendance_count?: number;
  total_sessions?: number;
  attendance_percentage?: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  class_name: string;
  semester: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FaceEmbeddingRecord {
  id: string;
  student_id: string;
  embedding: number[]; // 128 float array
  sample_count: number;
  model_version: string;
  created_at: string;
  updated_at: string;
}

export type SessionStatus = "active" | "completed" | "cancelled";

export interface AttendanceSession {
  id: string;
  subject_id: string;
  created_by?: string;
  started_at: string;
  ended_at?: string;
  status: SessionStatus;
  class_name: string;
  semester: string;
  created_at: string;
  // Joined fields
  subject?: Subject;
  records_count?: number;
}

export type AttendanceStatus = "present" | "absent";

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  confidence: number;
  marked_at: string;
  // Joined fields
  student?: Student;
}

export interface RecognitionCandidate {
  studentId: string;
  name: string;
  rollNumber: string;
  distance: number;
  confidence: number;
}

export interface EnrolledMatcherItem {
  studentId: string;
  name: string;
  rollNumber: string;
  embedding: Float32Array;
}
