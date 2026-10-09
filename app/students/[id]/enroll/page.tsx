"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { dbService } from "@/services/db";
import { loadFaceRecognitionModels, getFaceApi } from "@/lib/face-recognition/models";
import { checkFaceQuality } from "@/lib/face-recognition/quality";
import { computeEmbeddingCentroid } from "@/lib/face-recognition/matcher";
import { Student } from "@/types";

export default function StudentReEnrollPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);

  // Calibration State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<string>("INITIALIZING WEBGL FACENET...");
  const [isModelsReady, setIsModelsReady] = useState(false);

  // Poses & Embeddings
  const [currentPose, setCurrentPose] = useState<"frontal" | "left" | "right">("frontal");
  const [capturedEmbeddings, setCapturedEmbeddings] = useState<Float32Array[]>([]);
  const [qualityFeedback, setQualityFeedback] = useState<string>("OPTIMAL");
  const [isCapturing, setIsCapturing] = useState(false);
  const sampleLimit = 24;

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudent() {
      try {
        const data = await dbService.getStudentById(studentId);
        setStudent(data);
      } catch (err) {
        console.error("Failed loading student:", err);
      } finally {
        setLoadingStudent(false);
      }
    }
    fetchStudent();
  }, [studentId]);

  // Start Camera and FaceNet Models
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initCamera() {
      if (!student) return;
      try {
        setModelStatus("LOADING TENSORFLOW FACENET...");
        await loadFaceRecognitionModels((pct, label) => {
          setModelStatus(`${label.toUpperCase()} (${pct}%)`);
        });
        setIsModelsReady(true);
        setModelStatus("ONLINE");

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Webcam access requires modern browser and HTTPS/localhost.");
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
          setCameraError(null);
        }
      } catch (err: any) {
        setCameraError(err?.message || "Failed initializing webcam hardware.");
      }
    }

    if (!loadingStudent && student) {
      initCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [loadingStudent, student]);

  // Optical Capture Loop
  const handleCaptureFrame = async () => {
    if (!videoRef.current || !isModelsReady || isCapturing) return;

    try {
      setIsCapturing(true);
      const faceapi = await getFaceApi();
      if (!faceapi) throw new Error("FaceAPI runtime offline.");

      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
        )
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!detection) {
        setQualityFeedback("NO FACE DETECTED // CENTER SUBJECT");
        return;
      }

      const quality = checkFaceQuality(
        detection,
        videoRef.current.videoWidth,
        videoRef.current.videoHeight
      );

      if (!quality.passed) {
        setQualityFeedback(quality.message?.toUpperCase() || "FACE POSE SUB-OPTIMAL");
        return;
      }

      const newEmbeddings = [...capturedEmbeddings, detection.descriptor];
      setCapturedEmbeddings(newEmbeddings);
      setQualityFeedback("CAPTURE VALID // CENTROID COMPONENT STORED");

      if (newEmbeddings.length === 8) setCurrentPose("left");
      else if (newEmbeddings.length === 16) setCurrentPose("right");
    } catch (err: any) {
      setQualityFeedback(err?.message || "INFERENCE ERROR");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSaveBiometrics = async () => {
    if (!student || capturedEmbeddings.length < 8) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const centroid = computeEmbeddingCentroid(capturedEmbeddings);
      // Update student record via dbService
      await dbService.updateStudent(student.id, {
        is_active: true,
      });

      // Save new face embedding to Supabase/localStorage
      const { supabase, isSupabaseConfigured } = await import("@/lib/supabase/client");
      if (isSupabaseConfigured() && supabase) {
        await supabase.from("face_embeddings").upsert({
          student_id: student.id,
          embedding: centroid,
          sample_count: capturedEmbeddings.length,
          model_version: "facenet-128d",
          updated_at: new Date().toISOString(),
        });
      }

      setSaveSuccess(true);
      setTimeout(() => {
        router.push(`/students/${student.id}`);
      }, 1200);
    } catch (err: any) {
      setSaveError(err?.message || "Failed to persist centroid vector.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingStudent) {
    return (
      <AppLayout>
        <div className="py-24 text-center font-mono text-xs text-[#9A9A94] uppercase tracking-widest">
          LOADING CALIBRATION TARGET // {studentId}...
        </div>
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout>
        <div className="py-24 text-center">
          <p className="font-mono text-sm text-[#C9C7BD] mb-4">STUDENT RECORD NOT FOUND</p>
          <Link href="/students" className="font-mono text-xs text-[#E3C283] hover:underline">
            &larr; RETURN TO ROSTER
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-[#222220] pb-4">
          <Link
            href={`/students/${student.id}`}
            className="text-[#9A9A94] hover:text-[#E3C283] font-mono text-xs flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> CANCEL CALIBRATION
          </Link>
          <span className="font-mono text-[10px] uppercase text-[#E3C283] tracking-widest">
            CALIBRATION PROTOCOL // 128-D CENTROID
          </span>
        </div>

        <div className="border border-[#222220] bg-[#0E0E0E] p-6">
          <div className="border-b border-[#222220] pb-4 mb-6">
            <span className="font-mono text-[10px] uppercase text-[#E3C283] tracking-widest block mb-1">
              [ BIOMETRIC RE-CALIBRATION ]
            </span>
            <h1 className="text-xl font-light text-[#F3F0E8] uppercase">
              {student.full_name} {"//"} ROLL {student.roll_number}
            </h1>
            <p className="text-xs text-[#9A9A94] mt-1 font-mono">
              Calibrate multi-pose facial vectors (Frontal, Left 15&deg;, Right 15&deg;) to update matching centroid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Viewport Left */}
            <div className="md:col-span-7 space-y-3">
              <div className="relative aspect-[4/3] bg-[#090909] border border-[#222220] overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover mirror"
                  playsInline
                  muted
                />

                {/* Reticle HUD overlay */}
                <div className="absolute inset-0 pointer-events-none border border-[#E3C283]/30 m-4 flex flex-col justify-between p-2 font-mono text-[9px] text-[#E3C283]">
                  <div className="flex justify-between">
                    <span>VEYRA // SENSOR_FEED</span>
                    <span>128-D FACENET</span>
                  </div>
                  <div className="flex justify-between">
                    <span>POSE: {currentPose.toUpperCase()}</span>
                    <span>STATUS: {modelStatus}</span>
                  </div>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-[#090909]/95 p-6 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-8 h-8 text-[#E3C283] mb-2" />
                    <p className="font-mono text-xs text-[#C9C7BD] mb-2">{cameraError}</p>
                    <p className="font-mono text-[10px] text-[#9A9A94]">
                      Verify webcam permissions in browser address bar.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-[#9A9A94]">{qualityFeedback}</span>
                <Button
                  onClick={handleCaptureFrame}
                  disabled={!cameraActive || isCapturing || capturedEmbeddings.length >= sampleLimit}
                  variant="champagne"
                  size="sm"
                  className="font-mono text-xs uppercase"
                >
                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                  CAPTURE SAMPLE ({capturedEmbeddings.length}/{sampleLimit})
                </Button>
              </div>
            </div>

            {/* Calibration Ledger Right */}
            <div className="md:col-span-5 space-y-4">
              <div className="border border-[#222220] bg-[#131313] p-4 font-mono text-xs space-y-3">
                <div className="text-[10px] uppercase text-[#E3C283] tracking-wider border-b border-[#222220] pb-2">
                  CALIBRATION PROGRESS
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#9A9A94]">FRONTAL (0&deg;):</span>
                    <span className={capturedEmbeddings.length >= 8 ? "text-[#E3C283]" : "text-[#474740]"}>
                      {Math.min(8, capturedEmbeddings.length)}/8 SAMPLES
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9A9A94]">LEFT (15&deg;):</span>
                    <span className={capturedEmbeddings.length >= 16 ? "text-[#E3C283]" : "text-[#474740]"}>
                      {Math.max(0, Math.min(8, capturedEmbeddings.length - 8))}/8 SAMPLES
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9A9A94]">RIGHT (15&deg;):</span>
                    <span className={capturedEmbeddings.length >= 24 ? "text-[#E3C283]" : "text-[#474740]"}>
                      {Math.max(0, Math.min(8, capturedEmbeddings.length - 16))}/8 SAMPLES
                    </span>
                  </div>
                </div>

                <div className="w-full bg-[#201F1F] h-1.5 overflow-hidden">
                  <div
                    className="bg-[#E3C283] h-full transition-all duration-300"
                    style={{ width: `${(capturedEmbeddings.length / sampleLimit) * 100}%` }}
                  />
                </div>
              </div>

              {saveError && (
                <div className="p-3 bg-[#201F1F] border border-red-500/50 text-red-400 font-mono text-xs">
                  {saveError}
                </div>
              )}

              {saveSuccess ? (
                <div className="p-3 bg-[#5C4612]/30 border border-[#E3C283] text-[#E3C283] font-mono text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  CENTROID COMMITTED. REDIRECTING...
                </div>
              ) : (
                <Button
                  onClick={handleSaveBiometrics}
                  disabled={capturedEmbeddings.length < 8 || isSaving}
                  variant="champagne"
                  className="w-full font-mono text-xs uppercase"
                >
                  {isSaving ? "COMPUTING & SAVING CENTROID..." : "SAVE & ACTIVATE NEW BIOMETRICS"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
