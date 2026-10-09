# Security & Authorization Architecture

## 1. Threat Model & Key Mitigations

| Threat | Legacy Risk | Modern Mitigation |
| :--- | :--- | :--- |
| **Biometric Interception** | Raw images dumped to local disk (`people/1bhavesh/1.jpg`) | **Zero raw image transit.** Only unit-normalized 128-float mathematical vectors stored. |
| **Camera Feed Eavesdropping** | Server video socket transmission | **Client-side only.** Frames processed in GPU memory; zero streaming to any server. |
| **Unauthorized Grade/Roster Tampering** | No authentication; anyone on desktop could delete | **Supabase Auth & PostgreSQL Row Level Security (RLS)** strictly enforcing role permissions. |
| **Duplicate Attendance Fraud** | In memory integer counter prone to race conditions | **Database Unique Constraint** `UNIQUE(session_id, student_id)` prevents multi-marking. |
| **Service Role Secret Leaks** | Often hardcoded in client scripts | Frontend strictly uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Service role secrets remain server-side. |

---

## 2. PostgreSQL Row Level Security (RLS) Specification

All relational tables enforce strict RLS:
- **`profiles`:** Users can read and update their own identity; administrators can audit all staff accounts.
- **`students`:** Authenticated teachers can read student roster data; only users with the `admin` role can create, modify, or delete students.
- **`subjects`:** Read-only for general staff; mutated exclusively by administrators.
- **`face_embeddings`:** Biometric mathematical vectors can only be accessed by authenticated sessions for matching purposes.
- **`attendance_sessions` & `attendance_records`:** Authenticated teachers and admins can initiate sessions and insert records. Duplicate records are rejected by PostgreSQL constraint violation.

---

## 3. Safe Credential Handling

- **Browser Scope:** Only public variables (`NEXT_PUBLIC_*`) are bundled into client-side assets.
- **Biometric Vector Protection:** Biometric vectors are mathematical abstractions that cannot be reversed into photographic faces, providing defense-in-depth against biometric extraction attacks.
- **HTTPS Transport:** In-transit encryption prevents man-in-the-middle attacks across all REST calls.
