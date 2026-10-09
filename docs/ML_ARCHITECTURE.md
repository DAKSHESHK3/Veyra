# Machine Learning & Computer Vision Architecture

## 1. Technical Decision Summary: From Python/Keras to Modern Browser Inference

### 1.1 Legacy Implementation Breakdown
In the original desktop system:
1. Face detection relied on OpenCV's 2001-era Haar Cascade Classifier (`FaceDetection/faces.xml`).
2. Faces were extracted and resized to $160 \times 160 \times 3$ with RGB pixel normalization (`/ 255.0`).
3. Face embeddings were extracted using a 92 MB pre-trained FaceNet Keras model (`PreTrained_model/facenet_keras.h5`), producing a 128-dimensional continuous vector.
4. Classification was done via an explicitly trained multi-layer perceptron (MLP) with dense layers (128 -> 64 -> 32 -> 16 -> $N_{classes}$) ending in a Softmax activation.
5. Every time a new student registered, the user had to click "Train The Model", triggering 400 epochs of full backpropagation on CPU/GPU.

### 1.2 Evaluation of Browser-Compatible Options

| Approach | Latency | Browser Size | Server Cost | Retrain Overhead | Assessment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Server-Side Video Streaming (WebRTC / RTMP to Python)** | High (network roundtrip) | Small | High (GPU server required) | High | ❌ Fragile, expensive, privacy concern |
| **Serverless Flask / FastAPI on Vercel** | Extreme timeout issues | Huge (500MB+ PyTorch/TF) | Fails serverless size limits | Impractical | ❌ Vercel function payload limits |
| **Client-Side FaceNet WebGL / WASM (Selected Architecture)** | Low (<30ms / frame) | ~8MB quantized | $0 (client WebGL / GPU) | Zero retrain (Metric Learning) | ✅ Production Grade, 100% Private |

### 1.3 Selected Architecture: Client-Side Metric Embedding with Temporal Verification
Instead of training an ad-hoc Softmax classifier that must be retrained whenever students change, modern production face recognition utilizes **Deep Metric Learning**:
1. **Face Detection & Landmark Alignment:** MobileNet SSD / TinyFaceDetector computes high-accuracy bounding boxes and 68 landmark points even in suboptimal lighting.
2. **Feature Extraction (128-Dimensional Space):** A browser-optimized FaceNet ResNet model processes the cropped, aligned face into an $L_2$-normalized vector:
   $$\mathbf{e} \in \mathbb{R}^{128}, \quad \|\mathbf{e}\|_2 = 1$$
3. **Similarity Metric (Vector Distance):**
   Given an observed face embedding $\mathbf{e}_{\text{live}}$ and an enrolled student embedding $\mathbf{e}_{\text{enrolled}}$, the Euclidean distance is:
   $$d(\mathbf{e}_{\text{live}}, \mathbf{e}_{\text{enrolled}}) = \sqrt{\sum_{i=1}^{128} (e_{\text{live}, i} - e_{\text{enrolled}, i})^2}$$
   Because both vectors are unit normalized, the Cosine Similarity is directly related:
   $$\text{sim}(\mathbf{e}_{\text{live}}, \mathbf{e}_{\text{enrolled}}) = 1 - \frac{d^2}{2}$$
   Confidence is expressed as:
   $$\text{Confidence} = \max\left(0, \min\left(1, 1 - \frac{d}{\tau_{\text{thresh}}}\right)\right)$$
   Where default matching threshold $\tau_{\text{thresh}} = 0.50$ (Euclidean distance threshold) or similarity $\ge 0.75$.
4. **Zero-Retraining Dynamic Enrollment:**
   When a student is added or removed, no neural network weights need updating. Only their enrolled embedding centroid vector is written to or queried from Supabase.

---

## 2. Multi-Step Sample Enrollment & Vector Quality Control

To prevent single-frame lighting artifacts or bad angles from ruining recognition accuracy, the enrollment pipeline employs an interactive 3-pose wizard:
1. **Frontal Capture:** 10 samples looking directly into the camera.
2. **Slight Left Turn (15°):** 10 samples capturing profile features.
3. **Slight Right Turn (15°):** 10 samples capturing opposing profile features.

### Quality Control Filters
Each sample frame must pass strict validation before inclusion:
- **Face Count Check:** Exactly one face detected in the frame. If multiple faces or no face are found, the sample is rejected.
- **Minimum Resolution Check:** Bounding box width and height must exceed $100 \times 100$ pixels.
- **Framing Check:** Bounding box must reside completely within the video boundaries with at least a 5% margin.
- **Brightness / Contrast Check:** Frame luma mean must be between 40 and 225 (avoiding pitch black or blown-out highlights).

### Centroid Computation
From the valid samples $\{\mathbf{e}_1, \mathbf{e}_2, \dots, \mathbf{e}_k\}$, the student's canonical enrolled embedding is computed as the normalized centroid:
$$\bar{\mathbf{e}} = \frac{\sum_{j=1}^k \mathbf{e}_j}{\left\|\sum_{j=1}^k \mathbf{e}_j\right\|_2}$$

---

## 3. Temporal Verification Engine

A major failure mode in simple camera attendance systems is single-frame false positives (e.g., someone briefly walking by in the background or momentary motion blur).

The system implements a **Sliding Window Temporal Verification Engine**:
- **Frame Ring Buffer:** Keeps track of candidate matches for the last $W$ frames (default $W = 15$ frames, ~1.0–1.5 seconds).
- **Identification Persistence Criterion:**
  A student is marked **Present** only if:
  1. The student is the top match in at least $K$ out of the last $N$ frames (e.g., $K = 8, N = 12$).
  2. The rolling average confidence exceeds the acceptance threshold $\theta = 0.80$.
  3. The student has not already been marked present in the active `attendance_session`.
- Once verified, a green affirmative bounding box and audio/toast notification triggers, and the student's status is committed to the attendance store and synchronized with the backend.

---

## 4. Performance & Hardware Acceleration
- **Inference Pipeline:** Utilizes WebGL 2.0 backend in modern browsers for hardware acceleration on Intel/AMD integrated GPUs as well as dedicated NVIDIA/Apple Silicon GPUs.
- **Frame Throttling:** Rather than running heavy inference on every single 60 FPS webcam frame, detection runs every 100ms (10 FPS) while canvas interpolation renders bounding box animations smoothly at 60 FPS.
- **Memory Optimization:** Model weights are loaded once upon initialization and retained in GPU memory. Garbage collection overhead is minimized by recycling tensor allocations.
