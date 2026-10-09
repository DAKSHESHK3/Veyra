"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Video,
  ShieldCheck,
  ChevronRight,
  User,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { dbService } from "@/services/db";
import { loadFaceRecognitionModels, getFaceApi, areModelsLoaded } from "@/lib/face-recognition/models";
import { checkFaceQuality } from "@/lib/face-recognition/quality";
import { computeEmbeddingCentroid } from "@/lib/face-recognition/matcher";

type Step = "info" | "camera" | "review";

export default function NewStudentEnrollmentPage() {
  const router = useRouter();

  // Wizard Step
  const [step, setStep] = useState<Step>("info");

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<string>("Initializing AI models...");
  const [isModelsReady, setIsModelsReady] = useState(false);

  // Pose Guidance & Samples
  const [currentPose, setCurrentPose] = useState<"frontal" | "left" | "right">("frontal");
  const [capturedEmbeddings, setCapturedEmbeddings] = useState<Float32Array[]>([]);
  const [qualityFeedback, setQualityFeedback] = useState<string>("Looking for face...");
  const [isCapturing, setIsCapturing] = useState(false);
  const sampleLimit = 24; // 8 frontal, 8 left, 8 right

  // Step 3: Review & Finalization
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize camera and models when entering Step 2
  useEffect(() => {
    let stream: MediaStream | null = null;
    let animId: number = 0;

    async function initCameraAndModels() {
      if (step !== "camera") return;

      try {
        setModelStatus("Loading FaceNet biometric weights...");
        await loadFaceRecognitionModels((pct, label) => {
          setModelStatus(`${label} (${pct}%)`);
        });
        setIsModelsReady(true);
        setModelStatus("Models active & ready.");

        // Start Webcam
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
      if (animId) {
        cancelAnimationFrame(animId);
      }
    };
  }, [step]);

  // Capture loop during camera step
  useEffect(() => {
    if (step !== "camera" || !cameraActive || !isModelsReady || !isCapturing) return;

    let active = true;
    let timerId: NodeJS.Timeout;

    const captureSample = async () => {
      if (!active || !videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

      try {
        const faceapi = await getFaceApi();
        if (!faceapi) return;

        // Detect single face with landmarks & descriptor
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
          .withFaceLandmarks(true)
          .withFaceDescriptor();

        if (detection) {
          const videoWidth = videoRef.current.videoWidth;
          const videoHeight = videoRef.current.videoHeight;
          const quality = checkFaceQuality(detection, videoWidth, videoHeight);

          if (quality.passed) {
            setQualityFeedback("✓ Sample accepted! Hold steady...");
            setCapturedEmbeddings((prev) => {
              const updated = [...prev, detection.descriptor];

              // Update pose guidance based on progress
              if (updated.length >= 8 && updated.length < 16) {
                setCurrentPose("left");
              } else if (updated.length >= 16) {
                setCurrentPose("right");
              }

              if (updated.length >= sampleLimit) {
                setIsCapturing(false);
                setStep("review");
              }
              return updated;
            });
          } else {
            setQualityFeedback(quality.message);
          }
        } else {
          setQualityFeedback("Looking for face... Please center yourself.");
        }
      } catch (err) {
        console.error("Frame capture error:", err);
      }

      if (active && isCapturing) {
        timerId = setTimeout(captureSample, 250); // Sample every 250ms
      }
    };

    timerId = setTimeout(captureSample, 300);

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
    setStep("camera");
  };

  // Handle Final Submission
  const handleCompleteEnrollment = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      if (capturedEmbeddings.length === 0) {
        throw new Error("No biometric samples captured. Please redo camera enrollment.");
      }

      // Compute normalized centroid vector across all valid samples
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

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/students" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Directory
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <span className={step === "info" ? "font-bold text-primary" : "text-muted-foreground"}>
              1. Information
            </span>
            <span>&rarr;</span>
            <span className={step === "camera" ? "font-bold text-primary" : "text-muted-foreground"}>
              2. Biometric Capture
            </span>
            <span>&rarr;</span>
            <span className={step === "review" ? "font-bold text-primary" : "text-muted-foreground"}>
              3. Review
            </span>
          </div>
        </div>

        {/* STEP 1: STUDENT INFORMATION */}
        {step === "info" && (
          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Student Enrollment: Step 1 of 3</CardTitle>
              <CardDescription>
                Enter student identification details. Roll numbers must be unique within the designated class.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleProceedToCamera}>
              <CardContent className="space-y-4">
                {infoError && (
                  <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                    {infoError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Student Full Name *</label>
                    <Input
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Roll Number *</label>
                    <Input
                      required
                      placeholder="e.g. 4"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Class / Section *</label>
                    <Input
                      required
                      placeholder="e.g. CS-5th"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Semester *</label>
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
                    <label className="text-xs font-semibold">Email Address (Optional)</label>
                    <Input
                      type="email"
                      placeholder="student@institution.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Contact Phone (Optional)</label>
                    <Input
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1">
                  <span className="font-semibold text-foreground block">Biometric Privacy Notice</span>
                  <p>
                    Your camera will be used to capture face samples for attendance recognition. Only mathematical 128-dimensional embedding vectors are persisted; continuous raw webcam video is never transmitted to external servers.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button type="submit">
                  Proceed to Camera Enrollment
                  <ChevronRight className="h-4 w-4 ml-1.5" />
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* STEP 2: CAMERA BIOMETRIC ENROLLMENT */}
        {step === "camera" && (
          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Biometric Face Capture</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Enrolling: <span className="font-semibold text-foreground">{fullName}</span> (Roll: {rollNumber})
                  </CardDescription>
                </div>
                <Badge variant={isModelsReady ? "success" : "secondary"} className="text-xs">
                  {modelStatus}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {cameraError ? (
                <div className="p-6 text-center space-y-3 rounded-xl border border-destructive/20 bg-destructive/10">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
                  <p className="font-semibold text-sm text-destructive">Camera Initialization Error</p>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">{cameraError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCameraError(null);
                      setStep("info");
                    }}
                  >
                    Return to Step 1
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Pose Guidance Banner */}
                  <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="text-primary font-bold uppercase tracking-wider text-[10px]">
                        Guided Capture Pose:
                      </span>
                      <p className="font-semibold text-foreground text-sm">
                        {currentPose === "frontal"
                          ? "1. Look directly at the camera"
                          : currentPose === "left"
                          ? "2. Turn your head slightly to the left"
                          : "3. Turn your head slightly to the right"}
                      </p>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {capturedEmbeddings.length} / {sampleLimit} Samples
                    </Badge>
                  </div>

                  {/* Video Viewport */}
                  <div className="relative aspect-video max-w-lg mx-auto rounded-2xl overflow-hidden bg-black shadow-inner border border-border">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

                    {/* Framing Reticle */}
                    <div className="absolute inset-8 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none flex items-center justify-center">
                      <span className="text-[11px] text-white/70 bg-black/40 px-2 py-0.5 rounded backdrop-blur">
                        Position Face Here
                      </span>
                    </div>

                    {/* Quality Feedback Pill */}
                    <div className="absolute bottom-3 left-3 right-3 text-center pointer-events-none">
                      <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-black/60 text-white backdrop-blur border border-white/10">
                        {qualityFeedback}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Capture Completion</span>
                      <span>{Math.round((capturedEmbeddings.length / sampleLimit) * 100)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(capturedEmbeddings.length / sampleLimit) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" size="sm" onClick={() => setStep("info")}>
                &larr; Back
              </Button>

              {!isCapturing && capturedEmbeddings.length < sampleLimit && (
                <Button
                  onClick={() => setIsCapturing(true)}
                  disabled={!cameraActive || !isModelsReady}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Start Auto-Capture ({sampleLimit} Samples)
                </Button>
              )}

              {isCapturing && (
                <Button
                  variant="secondary"
                  onClick={() => setIsCapturing(false)}
                >
                  Pause Capture
                </Button>
              )}

              {capturedEmbeddings.length >= sampleLimit && (
                <Button onClick={() => setStep("review")}>
                  Proceed to Review
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardFooter>
          </Card>
        )}

        {/* STEP 3: REVIEW & SAVE */}
        {step === "review" && (
          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Review & Finalize Enrollment</CardTitle>
              <CardDescription>
                Confirm student metadata and generated 128-d biometric feature centroid
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {saveError && (
                <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                  {saveError}
                </div>
              )}

              <div className="p-4 rounded-xl bg-muted/40 border space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Full Name</span>
                    <span className="font-bold text-sm text-foreground">{fullName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Roll Number</span>
                    <span className="font-mono font-bold text-sm text-foreground">{rollNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Class & Semester</span>
                    <span className="font-semibold text-foreground">
                      {className} • {semester}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Samples Centroid</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ {capturedEmbeddings.length} High-Quality Poses
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1 text-xs">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  Recognition Readiness: Verified
                </span>
                <p className="text-muted-foreground">
                  The student will be instantly recognizable across all active attendance sessions without requiring model retraining.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCapturedEmbeddings([]);
                  setStep("camera");
                }}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Recapture Samples
              </Button>

              <Button
                onClick={handleCompleteEnrollment}
                isLoading={isSaving}
              >
                Complete Enrollment
                <CheckCircle2 className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
