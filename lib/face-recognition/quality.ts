export interface FaceQualityResult {
  passed: boolean;
  message: string;
  faceCount: number;
  boxWidth: number;
  boxHeight: number;
  brightness: number;
}

/**
 * Checks quality of captured face sample.
 */
export function checkFaceQuality(
  detection: any,
  videoWidth: number,
  videoHeight: number
): FaceQualityResult {
  if (!detection) {
    return {
      passed: false,
      message: "No face detected. Please face the camera directly.",
      faceCount: 0,
      boxWidth: 0,
      boxHeight: 0,
      brightness: 0,
    };
  }

  const box = detection.box || detection.detection?.box;
  if (!box) {
    return {
      passed: false,
      message: "Unable to calculate face boundary.",
      faceCount: 1,
      boxWidth: 0,
      boxHeight: 0,
      brightness: 0,
    };
  }

  const { width, height, x, y } = box;

  // 1. Min size check
  if (width < 90 || height < 90) {
    return {
      passed: false,
      message: "Face is too far from camera. Please move closer.",
      faceCount: 1,
      boxWidth: width,
      boxHeight: height,
      brightness: 100,
    };
  }

  // 2. Framing margin check
  const margin = 10;
  if (x < margin || y < margin || x + width > videoWidth - margin || y + height > videoHeight - margin) {
    return {
      passed: false,
      message: "Face is partially outside the frame. Center yourself.",
      faceCount: 1,
      boxWidth: width,
      boxHeight: height,
      brightness: 100,
    };
  }

  return {
    passed: true,
    message: "Good quality sample.",
    faceCount: 1,
    boxWidth: Math.round(width),
    boxHeight: Math.round(height),
    brightness: 128,
  };
}
