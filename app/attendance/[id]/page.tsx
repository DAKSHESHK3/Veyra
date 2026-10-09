"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Download,
  StopCircle,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Volume2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dbService } from "@/services/db";
import { loadFaceRecognitionModels, getFaceApi } from "@/lib/face-recognition/models";
import { FaceMatcher } from "@/lib/face-recognition/matcher";
import { TemporalVerificationEngine } from "@/lib/face-recognition/temporal";
import { AttendanceSession, AttendanceRecord, Student, RecognitionCandidate } from "@/types";
import { formatTime, formatDateTime } from "@/lib/utils";

export default function LiveAttendanceRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;

  // Session & Class Data
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Camera & Model State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [modelStatus, setModelStatus] = useState("Initializing facial AI...");

  // Session Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Active Recognition State
  const [liveCandidates, setLiveCandidates] = useState<RecognitionCandidate[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Engines Refs
  const matcherRef = useRef<FaceMatcher | null>(null);
  const temporalRef = useRef<TemporalVerificationEngine>(
    new TemporalVerificationEngine({ windowSize: 6, requiredMatches: 3, minAverageConfidence: 0.55 })
  );

  // Load Session and Enrolled Matchers
  useEffect(() => {
    async function initData() {
      if (!sessionId) return;
      try {
        const sess = await dbService.getAttendanceSessionById(sessionId);
        setSession(sess);

        const students = await dbService.getStudents();
        setAllStudents(students);

        const existingRecords = await dbService.getAttendanceRecords(sessionId);
        setRecords(existingRecords);

        // Populate verified set in temporal engine
        existingRecords.forEach((r) => {
          temporalRef.current.markAsAlreadyVerified(r.student_id);
        });

        // Initialize Face Matcher with active enrolled embeddings
        const matchers = await dbService.getEnrolledMatchers();
        matcherRef.current = new FaceMatcher(matchers, 0.55);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, [sessionId]);

  // Session Timer Effect
  useEffect(() => {
    if (session?.status !== "active") return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.status]);

  // Camera Ingestion & Inference
  const startCamera = async () => {
    setCameraError(null);
    try {
      setModelStatus("Loading models into WebGL memory...");
      await loadFaceRecognitionModels((pct, label) => {
        setModelStatus(`${label} (${pct}%)`);
      });
      setModelsReady(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Camera API is inaccessible. Please ensure you are running on localhost or HTTPS."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setCameraPermissionGranted(true);
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      let msg = "Could not activate camera.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Camera permission was denied. Please allow camera access in your browser address bar.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg = "No webcam device was detected on your computer.";
      } else if (err.name === "NotReadableError") {
        msg = "Webcam is currently in use by another software application.";
      } else {
        msg = err.message || msg;
      }
      setCameraError(msg);
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Inference Loop
  useEffect(() => {
    if (!cameraActive || !modelsReady || session?.status !== "active") return;

    let active = true;
    let timeoutId: NodeJS.Timeout;

    const runRecognitionFrame = async () => {
      if (
        !active ||
        !videoRef.current ||
        videoRef.current.paused ||
        videoRef.current.ended ||
        !canvasRef.current
      ) {
        return;
      }

      try {
        const faceapi = await getFaceApi();
        if (!faceapi || !matcherRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.videoWidth > 0 && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Detect all faces in current frame with 128-d descriptors
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
          .withFaceLandmarks(true)
          .withFaceDescriptors();

        const currentFrameCandidates: RecognitionCandidate[] = [];

        for (const det of detections) {
          const match = matcherRef.current.findBestMatch(det.descriptor);
          const box = det.detection.box;

          // Mirror calculation if video is mirrored
          const x = canvas.width - box.x - box.width;
          const y = box.y;
          const w = box.width;
          const h = box.height;

          if (match && match.studentId !== "unknown") {
            currentFrameCandidates.push(match);

            // Feed candidate to temporal verification engine
            const verified = temporalRef.current.processObservation(match);

            if (verified) {
              // STABLE RECOGNITION ACHIEVED! Record Attendance
              await handleMarkAttendance(verified);
            }

            // Draw Box
            const isVerified = temporalRef.current.isAlreadyVerified(match.studentId);
            ctx.strokeStyle = isVerified ? "#10b981" : "#3b82f6";
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, w, h);

            // Draw Label Badge
            const progress = temporalRef.current.getProgress(match.studentId);
            const label = isVerified
              ? `✓ ${match.name} (${Math.round(match.confidence * 100)}%)`
              : `${match.name} (${progress > 0 ? `${progress}%` : "Verifying..."})`;
            ctx.fillStyle = isVerified ? "rgba(16, 185, 129, 0.85)" : "rgba(59, 130, 246, 0.85)";
            ctx.fillRect(x, Math.max(0, y - 26), ctx.measureText(label).width + 16, 24);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText(label, x + 8, Math.max(16, y - 9));
          } else {
            // Unknown face
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);

            const label = "Unregistered Person";
            ctx.fillStyle = "rgba(245, 158, 11, 0.85)";
            ctx.fillRect(x, Math.max(0, y - 24), ctx.measureText(label).width + 16, 22);
            ctx.fillStyle = "#ffffff";
            ctx.font = "11px sans-serif";
            ctx.fillText(label, x + 8, Math.max(15, y - 8));
          }
        }

        setLiveCandidates(currentFrameCandidates);
      } catch (err) {
        console.error("Inference frame error:", err);
      }

      if (active) {
        timeoutId = setTimeout(runRecognitionFrame, 120); // ~8-10 FPS inference
      }
    };

    timeoutId = setTimeout(runRecognitionFrame, 200);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [cameraActive, modelsReady, session?.status]);

  // Mark Attendance Handler
  const handleMarkAttendance = async (candidate: RecognitionCandidate) => {
    try {
      const record = await dbService.recordAttendance(
        sessionId,
        candidate.studentId,
        candidate.confidence
      );

      setRecords((prev) => {
        if (prev.some((r) => r.student_id === candidate.studentId)) return prev;
        return [...prev, record];
      });

      setNotification(`✓ Attendance verified for ${candidate.name} (${Math.round(candidate.confidence * 100)}%)`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error("Attendance recording failed:", err);
    }
  };

  // End Session
  const handleEndSession = async () => {
    if (confirm("End this attendance session? Unrecognized students will remain unverified.")) {
      stopCamera();
      await dbService.endAttendanceSession(sessionId);
      const updated = await dbService.getAttendanceSessionById(sessionId);
      setSession(updated);
    }
  };

  // Real CSV Export
  const handleExportCSV = () => {
    if (!session) return;
    const subjectName = session.subject?.name || "Lecture";
    const dateStr = session.started_at ? session.started_at.split("T")[0] : "date";

    const headers = ["Roll Number", "Name", "Subject", "Date", "Status", "Confidence"];
    const rows = records.map((r) => [
      r.student?.roll_number || "—",
      `"${r.student?.full_name || "Unknown"}"`,
      `"${subjectName}"`,
      dateStr,
      r.status,
      r.confidence,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${subjectName.replace(/\s+/g, "_")}_Attendance_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!session) {
    return (
      <AppLayout>
        <div className="text-center py-12">Session not found.</div>
      </AppLayout>
    );
  }

  const presentStudentIds = new Set(records.map((r) => r.student_id));
  const classStudents = allStudents.filter((s) => s.class_name === session.class_name);
  const totalInClass = classStudents.length || allStudents.length;
  const presentCount = records.length;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Session Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/attendance" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                Take Attendance: {session.subject?.name}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 ml-6">
              Subject Code: <span className="font-mono font-bold">{session.subject?.code}</span> • Class: {session.class_name} ({session.semester})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border text-xs">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono font-semibold">{formatTime(elapsedSeconds)}</span>
            </div>

            <Badge
              variant={
                session.status === "active"
                  ? "success"
                  : session.status === "completed"
                  ? "outline"
                  : "destructive"
              }
              className="text-xs"
            >
              ● {session.status.toUpperCase()}
            </Badge>

            {session.status === "active" ? (
              <Button variant="destructive" size="sm" onClick={handleEndSession}>
                <StopCircle className="h-4 w-4 mr-1.5" />
                End Session
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-1.5" />
                Export CSV
              </Button>
            )}
          </div>
        </div>

        {/* Real-time Notification Banner */}
        {notification && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-sm animate-pulse-subtle">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {notification}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-mono">Synchronized</span>
          </div>
        )}

        {/* Live Grid: Video Room on Left, Recognized Roster on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Webcam Central Container */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-border/80 shadow-md overflow-hidden bg-black/95 text-white">
              <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      cameraActive ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"
                    }`}
                  />
                  Camera status: {cameraActive ? "Camera active (Live Feed)" : "Standby"}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {modelsReady ? "AI Model: Active" : modelStatus}
                </span>
              </div>

              <div className="relative aspect-video flex items-center justify-center bg-black">
                {/* Camera Inactive Prompt / Permission UX */}
                {!cameraActive && (
                  <div className="text-center p-6 space-y-4 max-w-sm">
                    <div className="h-14 w-14 rounded-2xl bg-zinc-800 text-primary mx-auto flex items-center justify-center shadow-lg">
                      <Camera className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-zinc-100">Camera Access Required</h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Camera access is required to take attendance using facial recognition. Inference runs 100% locally in your browser.
                      </p>
                    </div>

                    {cameraError && (
                      <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-left">
                        {cameraError}
                      </div>
                    )}

                    {session.status === "active" ? (
                      <Button onClick={startCamera} className="w-full shadow-lg shadow-primary/20">
                        <Play className="h-4 w-4 mr-2" />
                        Enable Camera
                      </Button>
                    ) : (
                      <div className="text-xs text-zinc-400">
                        This session has ended. Review recorded logs on the right.
                      </div>
                    )}
                  </div>
                )}

                {/* Video Element */}
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover scale-x-[-1] ${
                    cameraActive ? "block" : "hidden"
                  }`}
                />

                {/* Overlaid Detection Canvas */}
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 pointer-events-none ${
                    cameraActive ? "block" : "hidden"
                  }`}
                />
              </div>

              {cameraActive && (
                <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span>Temporal stability window: Active (8-frame filter)</span>
                  <Button variant="ghost" size="sm" onClick={stopCamera} className="h-7 text-xs text-zinc-300">
                    Pause Camera
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Real-time Recognition Roster & Present Count */}
          <div className="space-y-4">
            <Card className="border-border/80 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">Attendance Progress</CardTitle>
                  <Badge variant="outline" className="font-mono font-bold text-xs">
                    {presentCount} / {totalInClass} Present
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Students verified in current lecture session
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${totalInClass > 0 ? (presentCount / totalInClass) * 100 : 0}%`,
                    }}
                  />
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {records.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground space-y-1">
                      <Users className="h-6 w-6 mx-auto opacity-50" />
                      <p>No students verified yet</p>
                      <p className="text-[11px]">Facing the camera will automatically trigger recognition.</p>
                    </div>
                  ) : (
                    records.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-2.5 rounded-lg border border-border/80 bg-muted/30 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <div>
                            <p className="font-semibold text-foreground">
                              {rec.student?.full_name || "Enrolled Student"}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              Roll: {rec.student?.roll_number}
                            </p>
                          </div>
                        </div>
                        <Badge variant="success" className="text-[10px] font-mono">
                          {Math.round(rec.confidence * 100)}% Conf
                        </Badge>
                      </div>
                    ))
                  )}
                </div>

                {records.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleExportCSV} className="w-full text-xs">
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Download Session CSV
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
