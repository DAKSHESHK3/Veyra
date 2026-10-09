import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  Student,
  Subject,
  AttendanceSession,
  AttendanceRecord,
  FaceEmbeddingRecord,
  EnrolledMatcherItem,
} from "@/types";

const LOCAL_STORAGE_KEYS = {
  STUDENTS: "smart_att_students",
  SUBJECTS: "smart_att_subjects",
  SESSIONS: "smart_att_sessions",
  RECORDS: "smart_att_records",
  EMBEDDINGS: "smart_att_embeddings",
};

// Initial Seed Data reflecting the original project subjects & enrolled students
const INITIAL_SUBJECTS: Subject[] = [
  {
    id: "sub-1",
    name: "English Literature",
    code: "ENG101",
    class_name: "CS-5th",
    semester: "5th Semester",
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "sub-2",
    name: "Hindi Language & Comm",
    code: "HIN101",
    class_name: "CS-5th",
    semester: "5th Semester",
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "sub-3",
    name: "Machine Learning & AI",
    code: "CS503",
    class_name: "CS-5th",
    semester: "5th Semester",
    is_active: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const INITIAL_STUDENTS: Student[] = [
  {
    id: "stu-1",
    roll_number: "1",
    full_name: "Kushagra Verma",
    class_name: "CS-5th",
    semester: "5th Semester",
    email: "kushagra@college.edu",
    is_active: true,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "stu-2",
    roll_number: "2",
    full_name: "Bhavesh Bhatt",
    class_name: "CS-5th",
    semester: "5th Semester",
    email: "bhavesh@college.edu",
    is_active: true,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "stu-3",
    roll_number: "3",
    full_name: "Rishabh Jain",
    class_name: "CS-5th",
    semester: "5th Semester",
    email: "rishabh@college.edu",
    is_active: true,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

// Helper to get local storage item safely
function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("LocalStorage write error:", err);
  }
}

export const dbService = {
  // ================= SUBJECTS =================
  async getSubjects(): Promise<Subject[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw new Error(error.message);
      return data || [];
    }
    return getLocal<Subject[]>(LOCAL_STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  },

  async createSubject(subject: Omit<Subject, "id" | "created_at" | "updated_at">): Promise<Subject> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("subjects")
        .insert({
          ...subject,
          is_active: subject.is_active ?? true,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    }

    const current = getLocal<Subject[]>(LOCAL_STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    if (current.some((s) => s.code.toLowerCase() === subject.code.toLowerCase())) {
      throw new Error(`Subject with code "${subject.code}" already exists.`);
    }

    const newSubject: Subject = {
      ...subject,
      id: "sub-" + Math.random().toString(36).substring(2, 9),
      is_active: subject.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    current.push(newSubject);
    setLocal(LOCAL_STORAGE_KEYS.SUBJECTS, current);
    return newSubject;
  },

  // ================= STUDENTS =================
  async getStudents(): Promise<Student[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("roll_number", { ascending: true });
      if (error) throw new Error(error.message);
      return data || [];
    }
    return getLocal<Student[]>(LOCAL_STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },

  async getStudentById(id: string): Promise<Student | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .single();
      if (error) return null;
      return data;
    }
    const current = getLocal<Student[]>(LOCAL_STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    return current.find((s) => s.id === id) || null;
  },

  async createStudent(
    studentData: Omit<Student, "id" | "created_at" | "updated_at">,
    embeddingVector?: number[]
  ): Promise<Student> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: student, error: sErr } = await supabase
          .from("students")
          .insert({
            ...studentData,
            is_active: studentData.is_active ?? true,
          })
          .select()
          .single();
        if (sErr) throw new Error(sErr.message);

        if (embeddingVector && embeddingVector.length === 128) {
          const { error: eErr } = await supabase.from("face_embeddings").insert({
            student_id: student.id,
            embedding: embeddingVector,
            sample_count: 30,
            model_version: "facenet-128d",
          });
          if (eErr) {
            console.warn("Failed to save embedding to Supabase:", eErr.message);
          }
        }
        return student;
      } catch (err: any) {
        console.warn("Supabase createStudent failed, storing locally:", err?.message || err);
        // Fall through to local storage persistence
      }
    }

    const current = getLocal<Student[]>(LOCAL_STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    // Duplicate check
    const duplicate = current.find(
      (s) =>
        s.roll_number.toLowerCase() === studentData.roll_number.toLowerCase() &&
        s.class_name.toLowerCase() === studentData.class_name.toLowerCase()
    );
    if (duplicate) {
      throw new Error(`Roll number ${studentData.roll_number} already exists in class ${studentData.class_name}.`);
    }

    const newStudent: Student = {
      ...studentData,
      id: "stu-" + Math.random().toString(36).substring(2, 9),
      is_active: studentData.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    current.push(newStudent);
    setLocal(LOCAL_STORAGE_KEYS.STUDENTS, current);

    if (embeddingVector && embeddingVector.length === 128) {
      const embeddings = getLocal<FaceEmbeddingRecord[]>(LOCAL_STORAGE_KEYS.EMBEDDINGS, []);
      embeddings.push({
        id: "emb-" + Math.random().toString(36).substring(2, 9),
        student_id: newStudent.id,
        embedding: embeddingVector,
        sample_count: 30,
        model_version: "facenet-128d",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setLocal(LOCAL_STORAGE_KEYS.EMBEDDINGS, embeddings);
    }

    return newStudent;
  },

  async updateStudent(
    id: string,
    studentData: Partial<Omit<Student, "id" | "created_at" | "updated_at">>
  ): Promise<Student | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("students")
        .update({
          ...studentData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    }
    const current = getLocal<Student[]>(LOCAL_STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const index = current.findIndex((s) => s.id === id);
    if (index >= 0) {
      current[index] = {
        ...current[index],
        ...studentData,
        updated_at: new Date().toISOString(),
      };
      setLocal(LOCAL_STORAGE_KEYS.STUDENTS, current);
      return current[index];
    }
    return null;
  },

  async deleteStudent(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return;
    }
    const current = getLocal<Student[]>(LOCAL_STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    setLocal(
      LOCAL_STORAGE_KEYS.STUDENTS,
      current.filter((s) => s.id !== id)
    );
  },

  async getSubjectById(id: string): Promise<Subject | null> {
    const subjects = await this.getSubjects();
    return subjects.find((s) => s.id === id) || null;
  },

  async updateSubject(
    id: string,
    subjectData: Partial<Omit<Subject, "id" | "created_at" | "updated_at">>
  ): Promise<Subject | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("subjects")
        .update({
          ...subjectData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    }
    const current = getLocal<Subject[]>(LOCAL_STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    const index = current.findIndex((s) => s.id === id);
    if (index >= 0) {
      current[index] = {
        ...current[index],
        ...subjectData,
        updated_at: new Date().toISOString(),
      };
      setLocal(LOCAL_STORAGE_KEYS.SUBJECTS, current);
      return current[index];
    }
    return null;
  },

  async deleteSubject(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return;
    }
    const current = getLocal<Subject[]>(LOCAL_STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    setLocal(
      LOCAL_STORAGE_KEYS.SUBJECTS,
      current.filter((s) => s.id !== id)
    );
  },

  // ================= FACE EMBEDDINGS =================
  async saveEmbedding(studentId: string, embeddingVector: number[]): Promise<void> {
    if (embeddingVector.length !== 128) {
      throw new Error("Invalid embedding vector length. Expected 128 float values.");
    }

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from("face_embeddings").upsert(
        {
          student_id: studentId,
          embedding: embeddingVector,
          sample_count: 30,
          model_version: "facenet-128d",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "student_id" }
      );
      if (error) throw new Error(error.message);
      return;
    }

    const current = getLocal<FaceEmbeddingRecord[]>(LOCAL_STORAGE_KEYS.EMBEDDINGS, []);
    const existingIndex = current.findIndex((e) => e.student_id === studentId);
    if (existingIndex >= 0) {
      current[existingIndex].embedding = embeddingVector;
      current[existingIndex].updated_at = new Date().toISOString();
    } else {
      current.push({
        id: "emb-" + Math.random().toString(36).substring(2, 9),
        student_id: studentId,
        embedding: embeddingVector,
        sample_count: 30,
        model_version: "facenet-128d",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setLocal(LOCAL_STORAGE_KEYS.EMBEDDINGS, current);
  },

  async getEnrolledMatchers(): Promise<EnrolledMatcherItem[]> {
    const students = await this.getStudents();
    let embeddings: FaceEmbeddingRecord[] = [];

    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from("face_embeddings").select("*");
      embeddings = data || [];
    } else {
      embeddings = getLocal<FaceEmbeddingRecord[]>(LOCAL_STORAGE_KEYS.EMBEDDINGS, []);
    }

    const matchers: EnrolledMatcherItem[] = [];
    const embeddingMap = new Map<string, number[]>();
    for (const emb of embeddings) {
      embeddingMap.set(emb.student_id, emb.embedding);
    }

    for (const student of students) {
      const vec = embeddingMap.get(student.id);
      if (vec && vec.length === 128) {
        matchers.push({
          studentId: student.id,
          name: student.full_name,
          rollNumber: student.roll_number,
          embedding: new Float32Array(vec),
        });
      }
    }
    return matchers;
  },

  // ================= ATTENDANCE SESSIONS =================
  async getAttendanceSessions(): Promise<AttendanceSession[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("attendance_sessions")
        .select("*, subject:subjects(*)")
        .order("started_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    }
    const sessions = getLocal<AttendanceSession[]>(LOCAL_STORAGE_KEYS.SESSIONS, []);
    const subjects = await this.getSubjects();
    return sessions.map((sess) => ({
      ...sess,
      subject: subjects.find((s) => s.id === sess.subject_id),
    }));
  },

  async getAttendanceSessionById(id: string): Promise<AttendanceSession | null> {
    const sessions = await this.getAttendanceSessions();
    return sessions.find((s) => s.id === id) || null;
  },

  async createAttendanceSession(params: {
    subject_id: string;
    class_name: string;
    semester: string;
  }): Promise<AttendanceSession> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("attendance_sessions")
        .insert({
          subject_id: params.subject_id,
          class_name: params.class_name,
          semester: params.semester,
          status: "active",
        })
        .select("*, subject:subjects(*)")
        .single();
      if (error) throw new Error(error.message);
      return data;
    }

    const subjects = await this.getSubjects();
    const sub = subjects.find((s) => s.id === params.subject_id);

    const newSession: AttendanceSession = {
      id: "sess-" + Math.random().toString(36).substring(2, 9),
      subject_id: params.subject_id,
      class_name: params.class_name,
      semester: params.semester,
      status: "active",
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      subject: sub,
    };

    const current = getLocal<AttendanceSession[]>(LOCAL_STORAGE_KEYS.SESSIONS, []);
    current.unshift(newSession);
    setLocal(LOCAL_STORAGE_KEYS.SESSIONS, current);
    return newSession;
  },

  async endAttendanceSession(sessionId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from("attendance_sessions")
        .update({
          status: "completed",
          ended_at: new Date().toISOString(),
        })
        .eq("id", sessionId);
      if (error) throw new Error(error.message);
      return;
    }

    const current = getLocal<AttendanceSession[]>(LOCAL_STORAGE_KEYS.SESSIONS, []);
    const session = current.find((s) => s.id === sessionId);
    if (session) {
      session.status = "completed";
      session.ended_at = new Date().toISOString();
      setLocal(LOCAL_STORAGE_KEYS.SESSIONS, current);
    }
  },

  // ================= ATTENDANCE RECORDS =================
  async getAttendanceRecords(sessionId: string): Promise<AttendanceRecord[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*, student:students(*)")
        .eq("session_id", sessionId)
        .order("marked_at", { ascending: true });
      if (error) throw new Error(error.message);
      return data || [];
    }

    const records = getLocal<AttendanceRecord[]>(LOCAL_STORAGE_KEYS.RECORDS, []);
    const students = await this.getStudents();
    return records
      .filter((r) => r.session_id === sessionId)
      .map((r) => ({
        ...r,
        student: students.find((s) => s.id === r.student_id),
      }));
  },

  async getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*, student:students(*)")
        .order("marked_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    }

    const records = getLocal<AttendanceRecord[]>(LOCAL_STORAGE_KEYS.RECORDS, []);
    const students = await this.getStudents();
    return records
      .map((r) => ({
        ...r,
        student: students.find((s) => s.id === r.student_id),
      }))
      .sort((a, b) => new Date(b.marked_at).getTime() - new Date(a.marked_at).getTime());
  },

  async recordAttendance(
    sessionId: string,
    studentId: string,
    confidence: number
  ): Promise<AttendanceRecord> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from("attendance_records")
          .insert({
            session_id: sessionId,
            student_id: studentId,
            status: "present",
            confidence: Number(confidence.toFixed(4)),
          })
          .select("*, student:students(*)")
          .single();
        if (!error && data) return data;
        if (error) console.warn("Supabase recordAttendance notice:", error.message);
      } catch (err: any) {
        console.warn("Supabase recordAttendance offline fallback:", err?.message || err);
      }
    }

    const records = getLocal<AttendanceRecord[]>(LOCAL_STORAGE_KEYS.RECORDS, []);
    const alreadyMarked = records.find(
      (r) => r.session_id === sessionId && r.student_id === studentId
    );
    if (alreadyMarked) {
      return alreadyMarked;
    }

    const students = await this.getStudents();
    const newRecord: AttendanceRecord = {
      id: "rec-" + Math.random().toString(36).substring(2, 9),
      session_id: sessionId,
      student_id: studentId,
      status: "present",
      confidence: Number(confidence.toFixed(4)),
      marked_at: new Date().toISOString(),
      student: students.find((s) => s.id === studentId),
    };
    records.push(newRecord);
    setLocal(LOCAL_STORAGE_KEYS.RECORDS, records);
    return newRecord;
  },

  // ================= DASHBOARD & ANALYTICS =================
  async getDashboardStats() {
    const students = await this.getStudents();
    const subjects = await this.getSubjects();
    const sessions = await this.getAttendanceSessions();

    const todayStr = new Date().toISOString().split("T")[0];
    const todaySessions = sessions.filter(
      (s) => s.started_at && s.started_at.startsWith(todayStr)
    );

    let todayPresentCount = 0;
    const allRecords: AttendanceRecord[] = isSupabaseConfigured() && supabase
      ? (await supabase.from("attendance_records").select("*")).data || []
      : getLocal<AttendanceRecord[]>(LOCAL_STORAGE_KEYS.RECORDS, []);

    const todaySessionIds = new Set(todaySessions.map((s) => s.id));
    const todayPresentStudents = new Set<string>();

    for (const rec of allRecords) {
      if (todaySessionIds.has(rec.session_id) && rec.status === "present") {
        todayPresentStudents.add(rec.student_id);
      }
    }
    todayPresentCount = todayPresentStudents.size;
    const totalStudents = students.length;
    const todayAbsentCount = Math.max(0, totalStudents - todayPresentCount);
    const attendancePercentage =
      totalStudents > 0
        ? Math.round((todayPresentCount / totalStudents) * 100)
        : 0;

    return {
      totalStudents,
      todayPresentCount,
      todayAbsentCount,
      attendancePercentage,
      activeSubjectsCount: subjects.filter((s) => s.is_active).length,
      recentSessions: sessions.slice(0, 5),
    };
  },
};
