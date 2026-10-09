# Privacy Policy & Biometric Data Handling

## 1. Transparency on Biometric Ingestion

The Smart Attendance System is designed under a **Privacy-First Architecture**:

1. **Local Processing Guarantee:**
   Video captured by your device camera via `getUserMedia()` is ingested into local HTML5 video and canvas elements. Frame processing happens entirely in the browser's WebGL graphics pipeline. At no point is video or raw photography streamed to any server.

2. **Mathematical Vector Abstraction:**
   Instead of storing face images, the system extracts a 128-dimensional floating point representation (known as a feature embedding vector). These mathematical values are irreversible—they cannot be reverse-engineered to reconstruct the original high-resolution human face.

3. **Consent UX Notice:**
   Before initiating face enrollment, users are presented with clear consent disclosures explaining data usage, storage, and retention.

---

## 2. Data Lifecycle & Deletion

- **Who Can Access Student Biometrics?**
  Only authorized faculty and administrative staff with authenticated sessions can access attendance and embedding data via encrypted Supabase PostgREST connections.
- **How to Remove Biometric Profiles:**
  Administrators can delete a student's profile at any time from the **Students Directory**. Deleting a student cascades immediately in PostgreSQL (`ON DELETE CASCADE`), permanently deleting their face embedding and attendance history.
