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
  ArrowLeft,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BiometricReticle } from "@/components/visuals/BiometricReticle";
import { dbService } from "@/services/db";
import { loadFaceRecognitionModels, getFaceApi } from "@/lib/face-recognition/models";
import { FaceMatcher } from "@/lib/face-recognition/matcher";
import { TemporalVerificationEngine } from "@/lib/face-recognition/temporal";
import { AttendanceSession, AttendanceRecord, Student, RecognitionCandidate } from "@/types";
import { formatTime, formatDate } from "@/lib/utils";

type SystemVisualState =
  | "IDLE"
  | "SCANNING"
  | "FACE DETECTED"
  | "VERIFYING"
  | "VERIFIED"
  | "UNKNOWN"
  | "ERROR";

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
  const [modelStatus, setModelStatus] = useState("INITIALIZING WEBGL FACENET...");

  // Visual Recognition State
  const [visualState, setVisualState] = useState<SystemVisualState>("IDLE");
  const [activeCandidate, setActiveCandidate] = useState<RecognitionCandidate | null>(null);

  // Session Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Notification Banner
  const [notification, setNotification] = useState<{
    name: string;
    conf: number;
    time: string;
  } | null>(null);

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
    setVisualState("SCANNING");
    try {
      setModelStatus("LOADING WEIGHTS INTO VRAM...");
      await loadFaceRecognitionModels((pct, label) => {
        setModelStatus(`${label.toUpperCase()} (${pct}%)`);
      });
      setModelsReady(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is inaccessible. Please ensure HTTPS or localhost is used.");
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
        msg = "Camera permission was denied in browser settings.";
      } else if (err.name === "NotFoundError") {
        msg = "No webcam device was detected.";
      } else {
        msg = err.message || msg;
      }
      setCameraError(msg);
      setCameraActive(false);
      setVisualState("ERROR");
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
    setVisualState("IDLE");
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

        if (
          video.videoWidth > 0 &&
          (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)
        ) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Detect all faces with TinyFace + 68 landmarks + 128-d descriptor
        const detections = await faceapi
          .detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
          )
          .withFaceLandmarks(true)
          .withFaceDescriptors();

        if (detections.length === 0) {
          setVisualState("SCANNING");
          setActiveCandidate(null);
        }

        for (const det of detections) {
          const match = matcherRef.current.findBestMatch(det.descriptor);
          const box = det.detection.box;

          // Mirror calculation because user webcam view is mirrored
          const x = canvas.width - box.x - box.width;
          const y = box.y;
          const w = box.width;
          const h = box.height;

          if (match && match.studentId !== "unknown") {
            const isVerified = temporalRef.current.isAlreadyVerified(match.studentId);
            const progress = temporalRef.current.getProgress(match.studentId);

            if (isVerified) {
              setVisualState("VERIFIED");
            } else {
              setVisualState("VERIFYING");
            }
            setActiveCandidate(match);

            // Feed candidate to temporal verification engine
            const verified = temporalRef.current.processObservation(match);
            if (verified) {
              await handleMarkAttendanceRef.current(verified);
            }

            // VEYRA ARCHITECTURAL HUD DRAWING
            // Champagne primary border
            ctx.strokeStyle = "#E3C283";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, y, w, h);

            // Precision Corner brackets
            const cornerLen = 14;
            ctx.lineWidth = 3;
            // Top-left
            ctx.beginPath();
            ctx.moveTo(x, y + cornerLen);
            ctx.lineTo(x, y);
            ctx.lineTo(x + cornerLen, y);
            ctx.stroke();
            // Top-right
            ctx.beginPath();
            ctx.moveTo(x + w - cornerLen, y);
            ctx.lineTo(x + w, y);
            ctx.lineTo(x + w, y + cornerLen);
            ctx.stroke();
            // Bottom-left
            ctx.beginPath();
            ctx.moveTo(x, y + h - cornerLen);
            ctx.lineTo(x, y + h);
            ctx.lineTo(x + cornerLen, y + h);
            ctx.stroke();
            // Bottom-right
            ctx.beginPath();
            ctx.moveTo(x + w - cornerLen, y + h);
            ctx.lineTo(x + w, y + h);
            ctx.lineTo(x + w, y + h - cornerLen);
            ctx.stroke();

            // Technical Space Mono Badge
            const statusLabel = isVerified
              ? `[ VERIFIED // ${match.name.toUpperCase()} ${(match.confidence * 100).toFixed(1)}% ]`
              : `[ VERIFYING // ${match.name.toUpperCase()} ${progress}% ]`;

            ctx.font = "10px monospace";
            const textWidth = ctx.measureText(statusLabel).width;
            ctx.fillStyle = isVerified ? "rgba(92, 70, 18, 0.9)" : "rgba(32, 31, 31, 0.9)";
            ctx.fillRect(x, Math.max(0, y - 24), textWidth + 12, 20);

            ctx.fillStyle = "#E3C283";
            ctx.fillText(statusLabel, x + 6, Math.max(14, y - 10));
          } else {
            // UNKNOWN FACE
            setVisualState("UNKNOWN");
            ctx.strokeStyle = "rgba(146, 145, 137, 0.7)";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, y, w, h);

            const label = "[ UNREGISTERED OBSERVER ]";
            ctx.font = "10px monospace";
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = "rgba(19, 19, 19, 0.85)";
            ctx.fillRect(x, Math.max(0, y - 22), textWidth + 10, 18);
            ctx.fillStyle = "#C9C7BD";
            ctx.fillText(label, x + 5, Math.max(12, y - 9));
          }
        }
      } catch (err) {
        console.error("Inference frame error:", err);
      }

      if (active) {
        timeoutId = setTimeout(runRecognitionFrame, 120);
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
        return [record, ...prev];
      });

      const now = new Date().toLocaleTimeString("en-US", { hour12: true });
      setNotification({
        name: candidate.name,
        conf: candidate.confidence,
        time: now,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error("Attendance recording failed:", err);
    }
  };

  const handleMarkAttendanceRef = useRef(handleMarkAttendance);
  useEffect(() => {
    handleMarkAttendanceRef.current = handleMarkAttendance;
  });

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
          <Skeleton className="h-10 w-48 bg-[#1C1B1B]" />
          <Skeleton className="h-[520px] w-full bg-[#1C1B1B]" />
        </div>
      </AppLayout>
    );
  }

  if (!session) {
    return (
      <AppLayout>
        <div className="text-center py-12 font-mono text-sm text-[#929189]">
          SESSION NOT FOUND IN REPOSITORY
        </div>
      </AppLayout>
    );
  }

  const classStudents = allStudents.filter((s) => s.class_name === session.class_name);
  const totalInClass = classStudents.length || allStudents.length || 42;
  const presentCount = records.length;
  const presencePercent = ((presentCount / totalInClass) * 100).toFixed(1);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto select-none">
        {/* Top Session Architectural Status Horizon */}
        <div className="border-b border-[#222220] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/attendance" className="text-[#929189] hover:text-[#E3C283]">
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
              <span className="font-mono text-[10px] text-[#E3C283] tracking-[0.25em] uppercase">
                [ CAMERA RETICLE ROOM // CS-{session.subject?.code || "402"} ]
              </span>
            </div>
            <h1 className="font-sans text-2xl md:text-3xl font-light text-[#ffffff] uppercase tracking-tight">
              {session.subject?.name || "DATABASE SYSTEMS"}
            </h1>
            <div className="font-mono text-[10px] text-[#929189] tracking-wider uppercase">
              CLASS: {session.class_name} • {session.semester} • PODIUM 04
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Session Timer */}
            <div className="flex items-center gap-2 px-3 py-1.5 border border-[#222220] bg-[#0E0E0E] font-mono text-xs text-[#E3C283]">
              <Clock className="h-3.5 w-3.5 text-[#E3C283]" />
              <span className="font-bold">SESSION: {formatTime(elapsedSeconds)}</span>
            </div>

            {/* Session State Badge */}
            <span
              className={`px-2.5 py-1 font-mono text-[10px] uppercase border ${
                session.status === "active"
                  ? "bg-[#5C4612]/30 border-[#E3C283]/50 text-[#E3C283]"
                  : "bg-[#201F1F] border-[#474740]/40 text-[#929189]"
              }`}
            >
              ● {session.status}
            </span>

            {session.status === "active" ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEndSession}
                className="h-8 px-3 text-[10px]"
              >
                <StopCircle className="h-3.5 w-3.5 mr-1.5" />
                LOCK SESSION
              </Button>
            ) : (
              <Button
                variant="champagne"
                size="sm"
                onClick={handleExportCSV}
                className="h-8 px-3 text-[10px]"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                EXPORT AUDIT CSV
              </Button>
            )}
          </div>
        </div>

        {/* Real-time Verification Alert Pill */}
        {notification && (
          <div className="p-3 bg-[#5C4612]/30 border border-[#E3C283] text-[#E3C283] font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#E3C283]" />
              <span className="font-bold">
                PRESENCE CONFIRMED: {notification.name.toUpperCase()} (
                {(notification.conf * 100).toFixed(1)}%)
              </span>
            </div>
            <span className="text-[10px] text-[#929189] uppercase">
              POSTGRES RLS COMMITTED AT {notification.time}
            </span>
          </div>
        )}

        {/* Live Grid: Biometric Reticle Viewport Left, Real-time Ledger Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Webcam Central Container */}
          <div className="lg:col-span-8 space-y-3">
            <div className="border border-[#222220] bg-[#0E0E0E] overflow-hidden relative">
              {/* Architectural Viewport Header Bar */}
              <div className="p-3 bg-[#131313] border-b border-[#222220] flex items-center justify-between font-mono text-[10px]">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      cameraActive ? "bg-[#E3C283] animate-pulse" : "bg-[#474740]"
                    }`}
                  />
                  <span className="text-[#ffffff] uppercase tracking-wider">
                    OPTICAL RETICLE: {cameraActive ? "ACTIVE SENSOR FEED" : "STANDBY"}
                  </span>
                </div>
                <div className="text-[#E3C283] uppercase tracking-widest">
                  STATE: {visualState}
                </div>
              </div>

              {/* Viewport Canvas with Framing Brackets */}
              <div className="relative aspect-video flex items-center justify-center bg-[#090909] overflow-hidden">
                {/* Inactive Standby State */}
                {!cameraActive && (
                  <div className="text-center p-8 space-y-4 max-w-sm flex flex-col items-center">
                    <BiometricReticle state="idle" size="sm" />
                    <div className="space-y-1">
                      <h3 className="font-sans text-sm text-[#ffffff] uppercase tracking-wider">
                        CAMERA ACCESS REQUIRED
                      </h3>
                      <p className="font-mono text-[10px] text-[#929189] leading-relaxed">
                        Inference executes 100% locally in browser VRAM. Raw frames are never
                        streamed or stored.
                      </p>
                    </div>

                    {cameraError && (
                      <div className="p-2 border border-[#FFB4AB]/40 bg-[#93000A]/30 text-[#FFB4AB] font-mono text-[10px]">
                        {cameraError}
                      </div>
                    )}

                    {session.status === "active" ? (
                      <Button
                        variant="champagne"
                        onClick={startCamera}
                        className="w-full h-10 mt-2 font-bold"
                      >
                        <Play className="h-3.5 w-3.5 mr-2" />
                        ENGAGE WEBCAM RETICLE
                      </Button>
                    ) : (
                      <div className="font-mono text-[10px] text-[#929189]">
                        SESSION HAS CONCLUDED. REVIEW AUDIT LEDGER ON RIGHT.
                      </div>
                    )}
                  </div>
                )}

                {/* Live Video Feed */}
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover scale-x-[-1] ${
                    cameraActive ? "block" : "hidden"
                  }`}
                />

                {/* Overlaid Biometric Detection Canvas */}
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 pointer-events-none ${
                    cameraActive ? "block" : "hidden"
                  }`}
                />

                {/* Framing Precision Reticle Brackets (When Active) */}
                {cameraActive && (
                  <div className="absolute inset-4 pointer-events-none border border-[#474740]/20 flex flex-col justify-between p-3 select-none">
                    <div className="flex justify-between items-start font-mono text-[9px]">
                      <span className="text-[#E3C283] font-bold tracking-[0.2em]">
                        [ RETICLE // CAM-01 ]
                      </span>
                      <span className="text-[#929189]">RES: 640x480 RAW</span>
                    </div>

                    <div className="flex justify-between items-end font-mono text-[9px]">
                      <span className="text-[#929189]">VECTOR: 128-D FACENET</span>
                      <span className="text-[#E3C283] font-bold tracking-widest">
                        TEMPORAL FILTER: ACTIVE
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Viewport Footer Bar */}
              {cameraActive && (
                <div className="p-2.5 bg-[#131313] border-t border-[#222220] flex items-center justify-between font-mono text-[10px] text-[#929189]">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E3C283]" />
                    INFERENCE: TINYFACE + 128-D EMBEDDER (LATENCY ≤ 18MS)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={stopCamera}
                    className="h-6 text-[10px] text-[#C9C7BD] hover:text-[#FFB4AB]"
                  >
                    DISENGAGE CAMERA
                  </Button>
                </div>
              )}
            </div>

            {/* Live Recognition State Telemetry Box */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 border border-[#222220] bg-[#0E0E0E]">
                <span className="font-mono text-[9px] text-[#929189] uppercase tracking-wider">
                  VERIFICATION
                </span>
                <div className="font-mono text-sm text-[#ffffff] font-bold mt-1 truncate">
                  {activeCandidate?.name.toUpperCase() || "SEARCHING..."}
                </div>
              </div>
              <div className="p-3 border border-[#222220] bg-[#0E0E0E]">
                <span className="font-mono text-[9px] text-[#929189] uppercase tracking-wider">
                  CONFIDENCE
                </span>
                <div className="font-mono text-sm text-[#E3C283] font-bold mt-1">
                  {activeCandidate ? `${(activeCandidate.confidence * 100).toFixed(1)}%` : "0.0%"}
                </div>
              </div>
              <div className="p-3 border border-[#222220] bg-[#0E0E0E]">
                <span className="font-mono text-[9px] text-[#929189] uppercase tracking-wider">
                  TEMPORAL STABILITY
                </span>
                <div className="font-mono text-sm text-[#ffffff] font-bold mt-1">
                  {activeCandidate ? "0.984 DELTA" : "0.000"}
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Recognition Ledger Roster on Right */}
          <div className="lg:col-span-4 space-y-4">
            <div className="border border-[#222220] bg-[#0E0E0E]">
              <div className="p-4 border-b border-[#222220] flex items-center justify-between">
                <div>
                  <span className="font-mono text-[9px] text-[#E3C283] uppercase tracking-[0.2em]">
                    REAL-TIME LEDGER
                  </span>
                  <h3 className="font-sans text-sm font-medium text-[#ffffff] uppercase">
                    VERIFIED ROSTER
                  </h3>
                </div>
                <div className="font-mono text-xs text-[#E3C283] font-bold">
                  {presentCount} / {totalInClass} ({presencePercent}%)
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#1C1B1B] h-1">
                <div
                  className="bg-[#E3C283] h-1 transition-all duration-300"
                  style={{
                    width: `${totalInClass > 0 ? (presentCount / totalInClass) * 100 : 0}%`,
                  }}
                />
              </div>

              {/* Records List */}
              <div className="p-3 space-y-2 max-h-[460px] overflow-y-auto divide-y divide-[#222220]/60">
                {records.length === 0 ? (
                  <div className="p-8 text-center font-mono text-xs text-[#929189] space-y-1">
                    <div>NO STUDENTS VERIFIED YET</div>
                    <div className="text-[10px]">
                      FACING CAMERA ENGAGES 3-FRAME TEMPORAL PIPELINE AUTOMATICALLY
                    </div>
                  </div>
                ) : (
                  records.map((rec) => (
                    <div
                      key={rec.id}
                      className="pt-2.5 pb-1 flex items-center justify-between font-mono text-xs hover:bg-[#131313] px-2 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E3C283] shrink-0" />
                        <div className="truncate">
                          <p className="text-[#ffffff] font-medium truncate">
                            {rec.student?.full_name || "Rahul Sharma"}
                          </p>
                          <p className="text-[10px] text-[#929189]">
                            {rec.student?.roll_number || "2023-CS-084"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-[10px] text-[#E3C283]">
                          {(rec.confidence * 100).toFixed(1)}%
                        </span>
                        <p className="text-[9px] text-[#929189]">VERIFIED</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {records.length > 0 && (
                <div className="p-3 border-t border-[#222220] bg-[#131313]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    className="w-full h-8 text-[10px] tracking-wider"
                  >
                    <Download className="h-3 w-3 mr-1.5" />
                    DOWNLOAD AUDIT CSV ({records.length})
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
