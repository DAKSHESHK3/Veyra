# Legacy Data Migration Guide

This document explains how records from the legacy Python/Tkinter MongoDB and CSV system can be transitioned into the modern Supabase web platform.

---

## 1. Legacy Data Sources Analyzed

The legacy project maintained student and attendance records across:
1. `Students_Enrollment.csv`: Stored Name and sequential Roll Number (e.g. `kushagra`, `1`; `bhavesh`, `2`; `rishabh`, `3`).
2. `MongoDB`: Local collections under database `students` named `Hindi` and `English` with schema:
   ```json
   { "Name": "kushagra", "Roll_number": 1, "Attendance": 0 }
   ```
3. `people/{roll_no}{name}/`: Stored raw cropped JPEG samples (`1.jpg` ... `30.jpg`).

---

## 2. Automated Migration Script

An automated TypeScript migration utility is provided at `scripts/migrate-existing-data.ts`.

### Running the Migration
```bash
npx tsx scripts/migrate-existing-data.ts
```

### What It Does:
1. Parses `legacy/Students_Enrollment.csv`.
2. Normalizes names (proper capitalization) and formats roll numbers.
3. Automatically maps classes and semesters (`CS-5th`, `5th Semester`).
4. Generates an idempotent SQL migration file at `supabase/migrations/002_legacy_seed_migration.sql`.
5. Resolves conflicts using `ON CONFLICT (roll_number, class_name) DO NOTHING`.

---

## 3. Biometric Image Re-Enrollment Recommendation

While the legacy system stored raw images in `people/`, those were low-resolution $160 \times 160$ crops captured using old OpenCV Haar cascades with significant compression.

**Recommended Practice:**
Import student roster data via the migration SQL, then utilize the new **3-Pose Interactive Enrollment Wizard** (`/students/new`) with modern WebGL landmark alignment. This produces significantly higher accuracy 128-d centroids with pose invariance.
