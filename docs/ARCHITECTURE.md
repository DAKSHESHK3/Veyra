# System Architecture Assessment & Blueprint

## 1. Executive Summary

The legacy project was a desktop prototype built with Python 3, Tkinter, OpenCV, Keras/FaceNet (`facenet_keras.h5`), and local MongoDB. While it demonstrated the core concept of automated biometric attendance, it suffered from severe production limitations:
- **Zero Web Support:** Required local Python, CUDA/C++ OpenCV dependencies, Tkinter desktop GUI.
- **Fixed Hardcoded Schema:** Only supported two subjects ("Hindi" and "English") with manual database collection names.
- **Fragile Training Cycle:** Required retraining a separate Keras Softmax classifier (`Face_recognition.MODEL`) every time a new student enrolled.
- **Security & Authorization Deficit:** No authentication, no role separation, unencrypted local image dumps, plaintext MongoDB with zero access controls.
- **Brittle Face Recognition:** Haar cascades are notoriously sensitive to head pose and lighting variations, causing high false-negative rates.
- **Desktop Hardware Dependency:** Required direct OS video capture access (`cv2.VideoCapture(0)`).

### The Modern Rebuild Blueprint
The modernized Smart Attendance System is a cloud-native, responsive web application built with:
- **Frontend:** Next.js (App Router), TypeScript (strict mode), Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend & Database:** Supabase (PostgreSQL with Row Level Security, Supabase Auth, Supabase Storage).
- **Client-Side Biometrics:** In-browser face detection and 128-dimensional embedding extraction using `@vladmandic/face-api` (optimized WebGL/WASM TensorFlow.js runtime).
- **Temporal Verification:** Sliding-window frame stability to eliminate transient false positives before recording attendance.
- **Privacy & Security:** Biometric embeddings stored as vector float arrays with Row Level Security; zero streaming of raw webcam feeds to any external server.

---

## 2. Legacy vs. Modern Architectural Comparison

| Dimension | Legacy System (Python/Tkinter) | Modern Rebuilt Platform (Next.js/Supabase) |
| :--- | :--- | :--- |
| **Runtime Environment** | Local desktop OS with Python 3.7+ & Tkinter | Modern browser (Chrome, Edge, Safari, Firefox) via HTTPS |
| **Webcam Ingestion** | `cv2.VideoCapture(0)` desktop API | `navigator.mediaDevices.getUserMedia({ video: ... })` |
| **Face Detection** | OpenCV Haar Cascade (`faces.xml`) | SSD MobileNet V1 / Tiny Face Detector (WebGL accelerated) |
| **Biometric Features** | 128-d FaceNet Keras embedding | 128-d ResNet-34 FaceNet embedding (browser TFJS) |
| **Identity Matching** | Custom-trained Softmax Dense MLP (needs retraining per student) | Metric learning vector similarity (Cosine / Euclidean distance) — instant zero-retrain enrollment |
| **Temporal Verification** | Raw counter loop incrementing to 30 | Configurable rolling sliding-window temporal consistency engine |
| **Persistence** | Local MongoDB (`mongodb://localhost:27017/`) | Managed PostgreSQL on Supabase with strict foreign keys & UUIDs |
| **Security & Access** | None (open desktop access) | Supabase Auth (JWT), RBAC (Admin & Teacher roles), Postgres RLS |
| **Multi-Tenancy / Subjects**| Hardcoded "Hindi" and "English" radio buttons | Dynamic subjects, classes, semesters, courses, and sessions |
| **Deployment** | Manual local execution | Vercel CDN deployment with zero server maintenance |

---

## 3. High-Level System Architecture

```mermaid
graph TD
    subgraph Client ["Client Browser (Next.js / TypeScript)"]
        UI["Modern Responsive UI (Tailwind / Lucide)"]
        Cam["Webcam Engine (getUserMedia / Permissions API)"]
        ML["Browser Biometrics (SSD / TinyFace + 128-d Net)"]
        TempEng["Temporal Verification Engine"]
        SyncQueue["Attendance Sync & Offline Queue"]
    end

    subgraph Supabase ["Supabase Backend (Managed BaaS)"]
        Auth["Supabase Auth (JWT / Roles)"]
        DB[("PostgreSQL Database (RLS Enforced)")]
        Storage["Supabase Storage (Encrypted Student Photos)"]
    end

    UI --> Cam
    Cam --> ML
    ML --> TempEng
    TempEng --> SyncQueue
    SyncQueue -->|HTTPS REST / PostgREST| DB
    UI -->|JWT Auth Session| Auth
    UI -->|Direct Upload (Audited)| Storage
```

---

## 4. Key Subsystem Specifications

### 4.1. Camera & Video Pipeline
- Strict permission flow requesting video streams with `1280x720` or `640x480` ideal constraints.
- Real-time HTML5 `<video>` preview linked to an overlay `<canvas>` for rendering high-precision bounding boxes, confidence chips, and recognition state.
- Graceful degradation for camera errors: `NotAllowedError`, `NotFoundError`, `NotReadableError`, and insecure context checks.

### 4.2. In-Browser Biometric Engine
- Models are hosted in `/models` and cached via browser CacheStorage / HTTP cache.
- Enrollment captures multiple diverse samples (frontal, slight left, slight right) with validation filters (single face, minimum size > 100px, good sharpness).
- Computes mean centroid embedding vector across valid samples.
- Enrollment creates a student record and stores the 128-d vector into `face_embeddings`.
- Attendance session loads active students' embeddings into an indexed in-memory lookup table.
- Inference runs on `requestAnimationFrame` throttled to 10-15 FPS to maintain 60 FPS UI responsiveness and near-zero CPU load.

### 4.3. Data Model & Integrity
- Fully relational database with UUID v4 primary keys.
- Constraints prevent duplicate student roll numbers within a class.
- Unique index on `attendance_records(session_id, student_id)` strictly prohibits duplicate attendance.
- Row Level Security guarantees teachers cannot delete student accounts or drop subjects.
