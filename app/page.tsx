"use client";

import Link from "next/link";
import {
  Sparkles,
  Camera,
  ShieldCheck,
  Cpu,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Lock,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-primary-foreground shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Veyra</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm">
                Open Dashboard
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent -z-10" />
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold">
            <Cpu className="h-3.5 w-3.5" />
            <span>WebGL 2.0 Client-Side Deep Metric Learning</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Smart attendance, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              without the paperwork.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Fast, secure face-recognition attendance powered directly from your browser.
            Zero Python installs, zero streaming video to external servers, instant temporal verification.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-7 text-base shadow-lg shadow-primary/20">
                Launch System
                <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            </Link>
            <Link href="/attendance/new">
              <Button size="lg" variant="outline" className="h-12 px-7 text-base">
                <Camera className="h-4 w-4 mr-2 text-primary" />
                Live Camera Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights / Features Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Engineered for Academic & Enterprise Precision
          </h2>
          <p className="text-muted-foreground text-sm">
            Transitioning the original OpenCV/Keras prototype into a resilient, production-ready web platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg">In-Browser FaceNet Inference</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Biometric 128-d feature embeddings are computed locally on your device via WebGL. Your raw camera stream never leaves your browser.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg">Temporal Verification</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Multi-frame rolling consistency algorithm prevents transient false-positives and guarantees reliable presence detection before marking records.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg">Postgres Row Level Security</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Relational integrity, role-based authorization (Admin vs Teacher), and automated duplicate attendance prevention enforced at the database layer.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works workflow */}
      <section className="py-16 px-6 bg-muted/30 border-y border-border/50">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">How It Works</h2>
            <p className="text-muted-foreground text-sm">Four seamless steps from enrollment to audited export.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Register Student",
                desc: "Enter roll number, course, and metadata with unique roll number constraints.",
              },
              {
                step: "02",
                title: "3-Pose Capture",
                desc: "Guided camera wizard captures frontal, left, and right samples with quality filters.",
              },
              {
                step: "03",
                title: "Live Attendance",
                desc: "Teacher opens subject session; camera recognizes enrolled faces in real time.",
              },
              {
                step: "04",
                title: "Export & Audit",
                desc: "Session locks automatically. Instant CSV export and longitudinal trend analytics.",
              },
            ].map((s) => (
              <div key={s.step} className="p-5 rounded-xl bg-card border border-border/60 space-y-2">
                <span className="text-xs font-bold text-primary tracking-widest">{s.step}</span>
                <h4 className="font-semibold text-base">{s.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 max-w-4xl mx-auto w-full space-y-8">
        <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-border/60 bg-card space-y-1.5">
            <h4 className="font-semibold text-sm">Do I need to install Python, OpenCV, or Tkinter?</h4>
            <p className="text-sm text-muted-foreground">
              No. The entire system is modern web technology. Inference runs in your browser via WebGL and WebAssembly. No Python or local terminal required.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-border/60 bg-card space-y-1.5">
            <h4 className="font-semibold text-sm">Are video frames uploaded to a server?</h4>
            <p className="text-sm text-muted-foreground">
              Never. Webcam frames are strictly processed inside the local browser tab. Only the computed 128-float mathematical embedding vectors and timestamped attendance markers are saved.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-border/60 bg-card space-y-1.5">
            <h4 className="font-semibold text-sm">Can a student be marked present twice in the same lecture?</h4>
            <p className="text-sm text-muted-foreground">
              No. The temporal engine filters duplicate events in memory, and the database enforces a strict `UNIQUE(session_id, student_id)` constraint.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 py-8 px-6 text-center text-xs text-muted-foreground space-y-2">
        <p>Veyra &copy; 2026. Verified Presence, Simplified. Built with Next.js, Supabase, and Browser Deep Metric Learning.</p>
        <div className="flex items-center justify-center gap-4 text-primary">
          <Link href="/docs/PRIVACY.md" className="hover:underline">Privacy Policy</Link>
          <Link href="/docs/SECURITY.md" className="hover:underline">Security Architecture</Link>
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        </div>
      </footer>
    </div>
  );
}
