Veyra

[Sign In](/login)[Open Dashboard](/dashboard)

WebGL 2.0 Client-Side Deep Metric Learning

# Smart attendance,   
without the paperwork.

Fast, secure face-recognition attendance powered directly from your browser. Zero Python installs, zero streaming video to external servers, instant temporal verification.

[Launch System](/dashboard)[Live Camera Demo](/attendance/new)

## Engineered for Academic & Enterprise Precision

Transitioning the original OpenCV/Keras prototype into a resilient, production-ready web platform.

### In-Browser FaceNet Inference

Biometric 128-d feature embeddings are computed locally on your device via WebGL. Your raw camera stream never leaves your browser.

### Temporal Verification

Multi-frame rolling consistency algorithm prevents transient false-positives and guarantees reliable presence detection before marking records.

### Postgres Row Level Security

Relational integrity, role-based authorization (Admin vs Teacher), and automated duplicate attendance prevention enforced at the database layer.

## How It Works

Four seamless steps from enrollment to audited export.

01

#### Register Student

Enter roll number, course, and metadata with unique roll number constraints.

02

#### 3-Pose Capture

Guided camera wizard captures frontal, left, and right samples with quality filters.

03

#### Live Attendance

Teacher opens subject session; camera recognizes enrolled faces in real time.

04

#### Export & Audit

Session locks automatically. Instant CSV export and longitudinal trend analytics.

## Frequently Asked Questions

#### Do I need to install Python, OpenCV, or Tkinter?

No. The entire system is modern web technology. Inference runs in your browser via WebGL and WebAssembly. No Python or local terminal required.

#### Are video frames uploaded to a server?

Never. Webcam frames are strictly processed inside the local browser tab. Only the computed 128-float mathematical embedding vectors and timestamped attendance markers are saved.

#### Can a student be marked present twice in the same lecture?

No. The temporal engine filters duplicate events in memory, and the database enforces a strict `UNIQUE(session_id, student_id)` constraint.

Veyra © 2026. Verified Presence, Simplified. Built with Next.js, Supabase, and Browser Deep Metric Learning.

[Privacy Policy](/docs/PRIVACY.md)[Security Architecture](/docs/SECURITY.md)[Dashboard](/dashboard)