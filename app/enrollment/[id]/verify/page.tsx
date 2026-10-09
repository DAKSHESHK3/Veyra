"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Camera, CheckCircle2, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { dbService } from "@/services/db";
import { loadFaceRecognitionModels, getFaceApi } from "@/lib/face-recognition/models";
import { FaceMatcher } from "@/lib/face-recognition/matcher";
import { Student } from "@/types";

export default function BiometricVerificationBenchPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [modelStatus, setModelStatus] = useState("INITIALIZING...");

  const [matchStatus, setMatchStatus] = useState<"IDLE" | "SCANNING" | "MATCH" | "NO_MATCH">("IDLE");
  const [matchConfidence, setMatchConfidence] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const s = await dbService.getStudentById(id);
        setStudent(s);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isCancelled = false;

    async function initCamera() {
      if (!student) return;
      try {
        setModelStatus("COMPILING WEBGPU/WEBGL SHADERS...");
        await loadFaceRecognitionModels((pct, label) => {
          setModelStatus(`${label.toUpperCase()} (${pct}%)`);
        });
        if (isCancelled) return;
        setModelsReady(true);
        setModelStatus("FACENET 128-D READY");

        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
        }
      } catch (err: any) {
        setCameraError(err?.message || "Camera access denied or unserviceable.");
      }
    }

    if (!loading && student) {
      initCamera();
    }

    return () => {
      isCancelled = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [loading, student]);

  // Verification frame loop
  useEffect(() => {
    if (!cameraActive || !modelsReady || !student) return;

    let active = true;
    let timer: any = null;

    const runCheck = async () => {
      if (!active || !videoRef.current) return;

      try {
        const faceapi = await getFaceApi();
        if (!faceapi) return;

        const detection = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
          )
          .withFaceLandmarks(true)
          .withFaceDescriptor();

        if (detection) {
          setMatchStatus("SCANNING");
          const enrolledItems = await dbService.getEnrolledMatchers();
          const target = enrolledItems.find((e) => e.studentId === student.id);

          if (target && target.embedding) {
            // Compute Euclidean distance
            let sumSq = 0;
            for (let i = 0; i < 128; i++) {
              const diff = detection.descriptor[i] - target.embedding[i];
              sumSq += diff * diff;
            }
            const dist = Math.sqrt(sumSq);
            setDistance(dist);
            const conf = Math.max(0, 1 - dist / 0.6);
            setMatchConfidence(conf);

            if (dist <= 0.5) {
              setMatchStatus("MATCH");
            } else {
              setMatchStatus("NO_MATCH");
            }
          }
        } else {
          setMatchStatus("IDLE");
        }
      } catch (err) {
        console.error("Test bench check err:", err);
      }

      if (active) {
        timer = setTimeout(runCheck, 250);
      }
    };

    runCheck();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [cameraActive, modelsReady, student]);

  if (loading) {
    return (
      <AppLayout>
        <div className="py-24 text-center font-mono text-xs text-[#9A9A94] uppercase tracking-widest">
          INITIALIZING VERIFICATION TEST HARNESS...
        </div>
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout>
        <div className="py-24 text-center">
          <p className="font-mono text-sm text-[#C9C7BD] mb-4">STUDENT RECORD NOT FOUND</p>
          <Link href="/enrollment" className="font-mono text-xs text-[#E3C283] hover:underline">
            &larr; RETURN TO ENROLLMENT REGISTRY
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
            href={`/enrollment/${student.id}`}
            className="text-[#9A9A94] hover:text-[#E3C283] font-mono text-xs flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> EXIT VERIFICATION BENCH
          </Link>
          <span className="font-mono text-[10px] uppercase text-[#E3C283] tracking-widest">
            TEST BENCH // &tau; DISTANCE COMPARATOR
          </span>
        </div>

        <div className="border border-[#222220] bg-[#0E0E0E] p-6">
          <div className="border-b border-[#222220] pb-4 mb-6">
            <span className="font-mono text-[10px] uppercase text-[#E3C283] tracking-widest block mb-1">
              [ REAL-TIME CENTROID VALIDATION ]
            </span>
            <h1 className="text-xl font-light text-[#F3F0E8] uppercase">
              {student.full_name} {"//"} ROLL {student.roll_number}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8">
              <div className="relative aspect-[4/3] bg-[#090909] border border-[#222220] overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover mirror"
                  playsInline
                  muted
                />

                <div className="absolute inset-0 pointer-events-none p-3 font-mono text-[10px] flex flex-col justify-between">
                  <div className="flex justify-between text-[#E3C283]">
                    <span>STATUS: {modelStatus}</span>
                    <span>TARGET: {student.roll_number}</span>
                  </div>

                  <div className="flex justify-between items-end">
                    <span
                      className={`px-2 py-1 uppercase border ${
                        matchStatus === "MATCH"
                          ? "bg-[#5C4612]/80 border-[#E3C283] text-[#E3C283]"
                          : matchStatus === "NO_MATCH"
                          ? "bg-[#201F1F]/80 border-red-500/60 text-red-400"
                          : "bg-[#131313]/80 border-[#222220] text-[#9A9A94]"
                      }`}
                    >
                      {matchStatus === "MATCH"
                        ? "IDENTITY CONFIRMED"
                        : matchStatus === "NO_MATCH"
                        ? "THRESHOLD EXCEEDED"
                        : "ACQUIRING SUBJECT..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 space-y-4 font-mono text-xs">
              <div className="border border-[#222220] bg-[#131313] p-4 space-y-3">
                <div className="text-[10px] uppercase text-[#E3C283] tracking-wider border-b border-[#222220] pb-2">
                  TELEMETRY METRICS
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#9A9A94]">EUCLIDEAN DISTANCE:</span>
                    <span className="text-[#F3F0E8]">
                      {distance !== null ? distance.toFixed(4) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9A9A94]">TARGET THRESHOLD:</span>
                    <span className="text-[#E3C283]">&le; 0.5000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9A9A94]">ESTIMATED CONFIDENCE:</span>
                    <span className="text-[#F3F0E8]">
                      {matchConfidence !== null
                        ? `${(matchConfidence * 100).toFixed(1)}%`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-[#222220] bg-[#090909] p-4 text-[10px] text-[#9A9A94] leading-relaxed">
                The Euclidean distance between the live 128-d descriptor and the enrolled centroid is continuously computed. Values &le; 0.50 indicate biometric concordance.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
