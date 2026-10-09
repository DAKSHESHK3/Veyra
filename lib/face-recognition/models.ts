// Client-side dynamic loader for face-api models
let faceapiInstance: any = null;
let modelsLoaded = false;
let modelLoadingPromise: Promise<boolean> | null = null;

export async function getFaceApi() {
  if (typeof window === "undefined") return null;
  if (!faceapiInstance) {
    const faceapi = await import("@vladmandic/face-api");
    faceapiInstance = faceapi;
  }
  return faceapiInstance;
}

export async function loadFaceRecognitionModels(
  onProgress?: (progress: number, label: string) => void
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (modelsLoaded) return true;
  if (modelLoadingPromise) return modelLoadingPromise;

  modelLoadingPromise = (async () => {
    try {
      const faceapi = await getFaceApi();
      if (!faceapi) return false;

      const MODEL_URL = "/models";

      onProgress?.(20, "Loading face detection models...");
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

      onProgress?.(50, "Loading facial landmark models...");
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);

      onProgress?.(80, "Loading 128-d biometric feature extractor...");
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

      onProgress?.(100, "Biometric models initialized.");
      modelsLoaded = true;
      return true;
    } catch (err) {
      console.error("Failed to load face recognition models:", err);
      modelsLoaded = false;
      modelLoadingPromise = null;
      throw err;
    }
  })();

  return modelLoadingPromise;
}

export function areModelsLoaded(): boolean {
  return modelsLoaded;
}
