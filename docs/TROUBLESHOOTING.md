# Troubleshooting & Diagnostic Guide

## 1. Camera Access Issues

### Error: `Camera permission was denied`
- **Cause:** Browser blocked webcam permissions.
- **Resolution:**
  - Click the **padlock or camera icon** in your browser address bar.
  - Set Camera permissions to **Allow**.
  - Refresh the page and click **"Enable Camera"**.

### Error: `Camera API is inaccessible / Insecure Context`
- **Cause:** Web APIs block video capture over plain HTTP on remote hostnames.
- **Resolution:**
  - On local development, always use `http://localhost:3000`.
  - For staging/production, deploy over **HTTPS** (automatic on Vercel).

### Error: `Webcam is currently in use by another software application`
- **Cause:** Another app (Zoom, Teams, Skype, or OpenCV Python script) is locking the hardware device.
- **Resolution:**
  - Terminate background Python processes or video calling apps.
  - Re-trigger camera initialization.

---

## 2. Facial Recognition & Accuracy Tuning

### Symptoms: Face is not recognized or classified as "Unknown"
- **Lighting:** Ensure the subject's face is evenly illuminated without harsh backlighting or deep shadows.
- **Distance:** Ensure the subject is within 0.5 to 1.5 meters of the camera so the bounding box exceeds $100 \times 100$ pixels.
- **Threshold Sensitivity:**
  - Navigate to **Settings** (`/settings`).
  - Adjust the **Euclidean Distance Threshold ($\tau$)**:
    - Default is `0.55`. If recognition is too strict, increase slightly to `0.60`.
    - If false positives occur, decrease to `0.50`.

### Symptoms: Recognition takes too long to mark present
- Adjust **Temporal Consistency Frames ($K$)** in **Settings**:
  - Lower the requirement from `5` frames to `3` frames for faster attendance marking.

---

## 3. Supabase & Database Errors

### Symptoms: Changes do not persist to Supabase
- Verify that your `.env.local` contains non-placeholder keys:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://<your-id>.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  ```
- Ensure SQL migration `001_initial_schema.sql` was executed in the Supabase SQL editor.
- Check the badge in the sidebar: it should read **"Cloud Sync (Supabase)"**. If it reads **"Local Storage"**, the app is running in offline demo mode.
