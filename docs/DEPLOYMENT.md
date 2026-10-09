# Vercel Deployment & Production Guide

This document describes how to deploy the Smart Attendance System to Vercel with zero serverless bottlenecks.

---

## 1. Architectural Advantages on Vercel

Unlike Python/Flask/Tkinter backends that exceed serverless timeout and container memory limits, this application is engineered for modern edge deployment:
- **Zero Python/C++ server dependencies:** No heavy OpenCV binaries, TensorFlow Python runtimes, or Torch models on the server.
- **Client-Side ML:** Facial detection and 128-d FaceNet embedding extraction run entirely inside client browsers via WebGL 2.0.
- **Lightweight Next.js Routes:** All pages are statically generated or standard lightweight Next.js server/client components.
- **Direct PostgREST Communication:** Data operations communicate directly with Supabase via secure HTTPS REST APIs.

---

## 2. Step-by-Step Vercel Deployment

### Method A: Deploy via Vercel Web Dashboard (Recommended)

1. Push your repository to GitHub, GitLab, or Bitbucket:
   ```bash
   git add .
   git commit -m "feat: complete web rebuild of smart attendance system"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New..." > "Project"**.
3. Import your repository.
4. In the **Configure Project** screen:
   - **Framework Preset:** Next.js (automatically detected)
   - **Root Directory:** `./`
5. Expand **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Public Anon Key
6. Click **Deploy**.

---

## 3. HTTPS & Camera Security in Production

> [!IMPORTANT]
> Modern web browsers (Chrome, Edge, Safari, Firefox, iOS, Android) strictly block `navigator.mediaDevices.getUserMedia` when loaded over plain HTTP on non-localhost domains.
> 
> Vercel automatically provisions SSL/TLS certificates and serves your application over **HTTPS**, satisfying this requirement out of the box.

---

## 4. Custom Domains & Header Configuration

If utilizing custom domains, ensure your DNS CNAME points to `cname.vercel-dns.com`.
No special `vercel.json` rewrites are required for WebGL model serving since model weights are statically hosted under `/public/models/`.
