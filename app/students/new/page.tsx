"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, RefreshCw, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dbService } from "@/services/db";
import { loadFaceRecognitionModels, getFaceApi } from "@/lib/face-recognition/models";
import { checkFaceQuality } from "@/lib/face-recognition/quality";
import { computeEmbeddingCentroid } from "@/lib/face-recognition/matcher";

type Step = "details" | "capture" | "verify";

export default function NewStudentEnrollmentPage() {
  const router = useRouter();

  // Wizard Step
  const [step, setStep] = useState<Step>("details");

  // Step 1: Student Information
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [className, setClassName] = useState("CS-5th");
  const [semester, setSemester] = useState("5th Semester");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [infoError, setInfoError] = useState<string | null>(null);

  // Step 2: Camera Enrollment State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<string>("INITIALIZING WEBGL FACENET...");
  const [isModelsReady, setIsModelsReady] = useState(false);

  // Pose Guidance & Samples
  const [currentPose, setCurrentPose] = useState<"frontal" | "left" | "right">("frontal");
  const [capturedEmbeddings, setCapturedEmbeddings] = useState<Float32Array[]>([]);
  const [qualityFeedback, setQualityFeedback] = useState<string>("OPTIMAL");
  const [isCapturing, setIsCapturing] = useState(false);
  const sampleLimit = 24; // 8 frontal, 8 left, 8 right

  // Step 3: Review & Finalization
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize camera and models when entering Step 2
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initCameraAndModels() {
      if (step !== "capture") return;

      try {
        setModelStatus("COMPILING WEBGL SHADERS...");
        await loadFaceRecognitionModels((pct, label) => {
          setModelStatus(`${label.toUpperCase()} (${pct}%)`);
        });
        setIsModelsReady(true);
        setModelStatus("ONLINE");

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Webcam access is unsupported in this browser or requires HTTPS.");
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
        console.error("Camera init error:", err);
        setCameraError(err?.message || "Failed to access camera. Check device permissions.");
        setCameraActive(false);
      }
    }

    initCameraAndModels();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [step]);

  // Capture loop during camera step
  useEffect(() => {
    if (step !== "capture" || !cameraActive || !isModelsReady || !isCapturing) return;

    let active = true;
    let timerId: NodeJS.Timeout;

    const captureSample = async () => {
      if (!active || !videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

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
          const videoWidth = videoRef.current.videoWidth;
          const videoHeight = videoRef.current.videoHeight;
          const quality = checkFaceQuality(detection, videoWidth, videoHeight);

          if (quality.passed) {
            setQualityFeedback("EXCELLENT");
            setCapturedEmbeddings((prev) => {
              const updated = [...prev, detection.descriptor];

              if (updated.length >= 8 && updated.length < 16) {
                setCurrentPose("left");
              } else if (updated.length >= 16) {
                setCurrentPose("right");
              }

              if (updated.length >= sampleLimit) {
                setIsCapturing(false);
                setStep("verify");
              }
              return updated;
            });
          } else {
            setQualityFeedback(quality.message.toUpperCase());
          }
        } else {
          setQualityFeedback("SEARCHING FOR CENTROID...");
        }
      } catch (err) {
        console.error("Frame capture error:", err);
      }

      if (active && isCapturing) {
        timerId = setTimeout(captureSample, 220);
      }
    };

    timerId = setTimeout(captureSample, 250);

    return () => {
      active = false;
      clearTimeout(timerId);
    };
  }, [step, cameraActive, isModelsReady, isCapturing]);

  // Handle Step 1 validation
  const handleProceedToCamera = (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError(null);
    if (!fullName.trim() || !rollNumber.trim()) {
      setInfoError("Student full name and roll number are mandatory.");
      return;
    }
    setStep("capture");
  };

  // Handle Final Submission
  const handleCompleteEnrollment = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      if (capturedEmbeddings.length === 0) {
        throw new Error("No biometric samples captured. Please redo camera enrollment.");
      }

      const centroid = computeEmbeddingCentroid(capturedEmbeddings);

      await dbService.createStudent(
        {
          full_name: fullName.trim(),
          roll_number: rollNumber.trim(),
          class_name: className.trim(),
          semester: semester.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          is_active: true,
        },
        centroid
      );

      router.push("/students");
    } catch (err: any) {
      setSaveError(err?.message || "Failed to complete enrollment.");
    } finally {
      setIsSaving(false);
    }
  };

  const poseLabel =
    currentPose === "frontal"
      ? "01 / 03 [ FRONTAL ]"
      : currentPose === "left"
      ? "02 / 03 [ LEFT 15° ]"
      : "03 / 03 [ RIGHT 15° ]";

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto select-none">
        {/* Step Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222220] pb-4">
          <Link
            href="/students"
            className="inline-flex items-center font-mono text-[10px] text-[#929189] hover:text-[#E3C283] transition-colors uppercase"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            [ ROSTER DIRECTORY ]
          </Link>

          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] uppercase">
            <span
              className={
                step === "details"
                  ? "text-[#E3C283] border-b border-[#E3C283] pb-0.5 font-bold"
                  : "text-[#929189]"
              }
            >
              01 DETAILS
            </span>
            <span className="text-[#474740]">/</span>
            <span
              className={
                step === "capture"
                  ? "text-[#E3C283] border-b border-[#E3C283] pb-0.5 font-bold"
                  : "text-[#929189]"
              }
            >
              02 CAPTURE
            </span>
            <span className="text-[#474740]">/</span>
            <span
              className={
                step === "verify"
                  ? "text-[#E3C283] border-b border-[#E3C283] pb-0.5 font-bold"
                  : "text-[#929189]"
              }
            >
              03 VERIFY
            </span>
          </div>
        </div>

        {/* STEP 1: DETAILS */}
        {step === "details" && (
          <div className="border border-[#222220] bg-[#0E0E0E]">
            <div className="p-6 border-b border-[#222220] space-y-1">
              <span className="font-mono text-[10px] text-[#E3C283] tracking-[0.25em] uppercase">
                [ STAGE 01 // IDENTITY PARAMETERS ]
              </span>
              <h2 className="font-sans text-xl text-[#ffffff] uppercase tracking-tight">
                REGISTER STUDENT PROFILE
              </h2>
              <p className="font-mono text-xs text-[#929189]">
                Provide academic metadata. Roll numbers are enforced unique at the Postgres layer.
              </p>
            </div>

            <form onSubmit={handleProceedToCamera} className="p-6 space-y-4">
              {infoError && (
                <div className="p-3 border border-[#FFB4AB]/40 bg-[#93000A]/30 text-[#FFB4AB] font-mono text-xs">
                  {infoError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] uppercase text-[#929189] tracking-wider">
                    STUDENT FULL NAME *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] uppercase text-[#929189] tracking-wider">
                    ROLL NUMBER IDENTIFIER *
                  </label>
                  <Input
                    required
                    placeholder="e.g. 2023-CS-084"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] uppercase text-[#929189] tracking-wider">
                    DEPARTMENT / SECTION *
                  </label>
                  <Input
                    required
                    placeholder="e.g. CSE / SEC-V"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] uppercase text-[#929189] tracking-wider">
                    ACADEMIC SEMESTER *
                  </label>
                  <Input
                    required
                    placeholder="e.g. 5th Semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] uppercase text-[#929189] tracking-wider">
                    EMAIL ADDRESS (OPTIONAL)
                  </label>
                  <Input
                    type="email"
                    placeholder="student@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] uppercase text-[#929189] tracking-wider">
                    CONTACT PHONE (OPTIONAL)
                  </label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-3 bg-[#131313] border border-[#222220] font-mono text-[10px] text-[#929189] space-y-1">
                <div className="flex items-center gap-1.5 text-[#E3C283]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E3C283]" />
                  PRIVACY PROTOCOL: ZERO RAW VIDEO PERSISTENCE
                </div>
                <div>
                  Webcam will sample 24 feature matrices locally to compute a 128-float centroid.
                  No photos or video feeds are transmitted to cloud storage.
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="champagne" className="h-10 px-6 font-bold">
                  PROCEED TO BIOMETRIC CALIBRATION →
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: CAPTURE */}
        {step === "capture" && (
          <div className="border border-[#222220] bg-[#0E0E0E] space-y-4">
            <div className="p-6 border-b border-[#222220] flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-[#E3C283] tracking-[0.25em] uppercase">
                  [ STAGE 02 // 3-POSE CALIBRATION ]
                </span>
                <h2 className="font-sans text-xl text-[#ffffff] uppercase tracking-tight">
                  BIOMETRIC CENTROID SEEDING: {fullName.toUpperCase()}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#131313] border border-[#222220] font-mono text-[10px] text-[#E3C283]">
                  ROLL: {rollNumber}
                </span>
                <span className="px-2.5 py-1 bg-[#131313] border border-[#222220] font-mono text-[10px] text-[#929189]">
                  ENGINE: {modelStatus}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Telemetry Status Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 border border-[#222220] bg-[#131313]">
                  <span className="font-mono text-[9px] text-[#929189] uppercase tracking-wider">
                    CAPTURE QUALITY
                  </span>
                  <div className="font-mono text-sm text-[#E3C283] font-bold mt-0.5">
                    {qualityFeedback}
                  </div>
                </div>

                <div className="p-3 border border-[#222220] bg-[#131313]">
                  <span className="font-mono text-[9px] text-[#929189] uppercase tracking-wider">
                    GUIDED POSE
                  </span>
                  <div className="font-mono text-sm text-[#ffffff] font-bold mt-0.5">
                    {poseLabel}
                  </div>
                </div>

                <div className="p-3 border border-[#222220] bg-[#131313]">
                  <span className="font-mono text-[9px] text-[#929189] uppercase tracking-wider">
                    FACE POSITION
                  </span>
                  <div className="font-mono text-sm text-[#E3C283] font-bold mt-0.5">
                    OPTIMAL
                  </div>
                </div>

                <div className="p-3 border border-[#222220] bg-[#131313]">
                  <span className="font-mono text-[9px] text-[#929189] uppercase tracking-wider">
                    SAMPLES
                  </span>
                  <div className="font-mono text-sm text-[#ffffff] font-bold mt-0.5">
                    {capturedEmbeddings.length} / {sampleLimit}
                  </div>
                </div>
              </div>

              {/* Video Viewport Chassis */}
              <div className="relative aspect-video max-w-2xl mx-auto border border-[#222220] bg-[#090909] overflow-hidden">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                {/* Framing Precision Biometric Brackets */}
                <div className="absolute inset-8 pointer-events-none border border-[#E3C283]/40 flex flex-col justify-between p-3 select-none">
                  <div className="flex justify-between items-start font-mono text-[9px]">
                    <span className="text-[#E3C283]">[ POSE: {currentPose.toUpperCase()} ]</span>
                    <span className="text-[#929189]">TINYFACE 320</span>
                  </div>

                  <div className="self-center w-24 h-24 rounded-full border border-dashed border-[#E3C283]/50 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-[#E3C283] animate-pulse" />
                  </div>

                  <div className="flex justify-between items-end font-mono text-[9px]">
                    <span className="text-[#929189]">VECTOR: 128-D EMBEDDER</span>
                    <span className="text-[#E3C283] font-bold">CALIBRATING</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 max-w-2xl mx-auto font-mono text-[10px]">
                <div className="flex justify-between text-[#929189]">
                  <span>PROGRESS COMPLETION</span>
                  <span className="text-[#E3C283]">
                    {Math.round((capturedEmbeddings.length / sampleLimit) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-[#1C1B1B] h-1.5">
                  <div
                    className="bg-[#E3C283] h-1.5 transition-all duration-300"
                    style={{
                      width: `${(capturedEmbeddings.length / sampleLimit) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Capture Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#222220]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep("details")}
                  className="border-[#474740]"
                >
                  &larr; BACK TO DETAILS
                </Button>

                {!isCapturing ? (
                  <Button
                    variant="champagne"
                    size="sm"
                    onClick={() => setIsCapturing(true)}
                    disabled={!cameraActive || !isModelsReady}
                    className="font-bold"
                  >
                    <Camera className="h-3.5 w-3.5 mr-2" />
                    BEGIN 3-POSE SAMPLING
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsCapturing(false)}
                  >
                    PAUSE SAMPLING
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: VERIFY */}
        {step === "verify" && (
          <div className="border border-[#222220] bg-[#0E0E0E]">
            <div className="p-6 border-b border-[#222220] space-y-1">
              <span className="font-mono text-[10px] text-[#E3C283] tracking-[0.25em] uppercase">
                [ STAGE 03 // AUDIT &amp; COMMIT ]
              </span>
              <h2 className="font-sans text-xl text-[#ffffff] uppercase tracking-tight">
                VERIFY CENTROID EMBEDDING
              </h2>
              <p className="font-mono text-xs text-[#929189]">
                Review computed 128-dimensional biometric mathematical representation
              </p>
            </div>

            <div className="p-6 space-y-6">
              {saveError && (
                <div className="p-3 border border-[#FFB4AB]/40 bg-[#93000A]/30 text-[#FFB4AB] font-mono text-xs">
                  {saveError}
                </div>
              )}

              {/* Summary Identity Card */}
              <div className="p-4 border border-[#222220] bg-[#131313] grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-[#929189] uppercase block">NAME</span>
                  <span className="text-[#ffffff] font-bold">{fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#929189] uppercase block">ROLL IDENTIFIER</span>
                  <span className="text-[#E3C283] font-bold">{rollNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#929189] uppercase block">BATCH</span>
                  <span className="text-[#C9C7BD]">{className}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#929189] uppercase block">STATUS</span>
                  <span className="text-[#E3C283]">CALIBRATED (24/24)</span>
                </div>
              </div>

              {/* Centroid Vector Preview */}
              <div className="p-4 border border-[#222220] bg-[#090909] font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between text-[#929189] border-b border-[#222220] pb-2">
                  <span className="text-[#ffffff] font-bold">
                    CENTROID // 128 FLOATS COMPUTED
                  </span>
                  <span className="text-[#E3C283]">L2 NORMALIZED</span>
                </div>
                <p className="text-[#929189] text-[10px]">
                  [+0.0481, -0.0198, +0.0890, +0.1042, -0.0512, +0.0381, +0.0092, -0.0781, ... 120
                  additional coordinate dimensions]
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#222220]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCapturedEmbeddings([]);
                    setStep("capture");
                  }}
                  className="border-[#474740]"
                >
                  <RefreshCw className="h-3 w-3 mr-1.5" />
                  RE-SAMPLE BIOMETRICS
                </Button>

                <Button
                  variant="champagne"
                  size="sm"
                  onClick={handleCompleteEnrollment}
                  isLoading={isSaving}
                  className="font-bold px-6"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                  COMMIT PROFILE TO POSTGRES RLS →
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
