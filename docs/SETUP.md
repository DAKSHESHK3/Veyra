# Local Development & Environment Setup Guide

This guide walks you through setting up and running the Smart Attendance System on your local development machine.

---

## 1. System Requirements

- **Node.js:** v18.0.0 or later (v20+ recommended)
- **Package Manager:** `npm` (v9+) or `pnpm`
- **Modern Web Browser:** Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari with WebGL 2.0 support.
- **Webcam:** Integrated laptop webcam or USB camera.

> [!NOTE]
> Camera access (`navigator.mediaDevices.getUserMedia`) requires a secure context. On local environments, `http://localhost:3000` is automatically treated as a secure context by modern browsers. For remote testing or production, **HTTPS is mandatory**.

---

## 2. Installation & Quick Start

### Step 1: Clone or Navigate to the Repository
```bash
cd ATTENDANCE
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

If you do not have Supabase keys yet, the application will automatically activate **Offline / Local Demo Mode** (persisting in browser local storage).

To connect live Supabase cloud persistence:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Step 4: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Automated Test Suite

Run the unit test suite covering vector metrics, temporal verification, and CSV export:
```bash
npm test
```

To run a production build test:
```bash
npm run build
```

---

## 4. Supabase Setup Instructions (Optional for Cloud Mode)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/001_initial_schema.sql` and run the entire script.
4. Open `supabase/migrations/002_legacy_seed_migration.sql` to import the seed students and subjects.
5. In **Project Settings > API**, copy the `Project URL` and `anon public key` into your `.env.local`.
6. Restart your development server (`npm run dev`). The status badge in the sidebar will switch to **Cloud Sync (Supabase)**.
