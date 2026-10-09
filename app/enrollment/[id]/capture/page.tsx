import StudentReEnrollPage from "@/app/students/[id]/enroll/page";

export const metadata = {
  title: "Biometric Pose Capture // Veyra",
  description: "Optical multi-pose calibration and 128-d centroid vector computation.",
};

export default function EnrollmentCaptureRoute() {
  return <StudentReEnrollPage />;
}
