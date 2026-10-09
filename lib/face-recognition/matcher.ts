import { EnrolledMatcherItem, RecognitionCandidate } from "@/types";

/**
 * Calculates Euclidean distance between two unit-normalized 128-dimensional embedding vectors.
 */
export function euclideanDistance(a: Float32Array | number[], b: Float32Array | number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Embedding dimensions do not match: ${a.length} vs ${b.length}`);
  }
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Calculates cosine similarity between two vectors.
 */
export function cosineSimilarity(a: Float32Array | number[], b: Float32Array | number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Computes the normalized centroid vector from multiple sample embeddings.
 */
export function computeEmbeddingCentroid(embeddings: (Float32Array | number[])[]): number[] {
  if (embeddings.length === 0) {
    throw new Error("Cannot compute centroid from empty sample array");
  }
  const dim = embeddings[0].length;
  const sum = new Float64Array(dim);

  for (const emb of embeddings) {
    for (let i = 0; i < dim; i++) {
      sum[i] += emb[i];
    }
  }

  // Calculate L2 norm
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += sum[i] * sum[i];
  }
  norm = Math.sqrt(norm);

  const centroid = new Array<number>(dim);
  for (let i = 0; i < dim; i++) {
    centroid[i] = norm > 0 ? Number((sum[i] / norm).toFixed(6)) : 0;
  }
  return centroid;
}

export class FaceMatcher {
  private enrolled: EnrolledMatcherItem[] = [];
  private distanceThreshold: number;

  constructor(enrolled: EnrolledMatcherItem[], distanceThreshold = 0.55) {
    this.enrolled = enrolled;
    this.distanceThreshold = distanceThreshold;
  }

  public setEnrolled(enrolled: EnrolledMatcherItem[]) {
    this.enrolled = enrolled;
  }

  /**
   * Finds the best match candidate among enrolled students.
   * If best distance is above threshold, returns unknown.
   */
  public findBestMatch(faceEmbedding: Float32Array | number[]): RecognitionCandidate | null {
    if (this.enrolled.length === 0) return null;

    let bestItem: EnrolledMatcherItem | null = null;
    let minDistance = Infinity;

    for (const item of this.enrolled) {
      const dist = euclideanDistance(faceEmbedding, item.embedding);
      if (dist < minDistance) {
        minDistance = dist;
        bestItem = item;
      }
    }

    if (!bestItem) return null;

    // Realistic confidence scaling for FaceNet Euclidean distance:
    // When distance = 0 -> 100% confidence
    // When distance = distanceThreshold (0.55) -> 75% confidence
    let confidence = 0;
    if (minDistance <= this.distanceThreshold) {
      confidence = 1 - 0.25 * (minDistance / this.distanceThreshold);
    } else {
      confidence = Math.max(
        0,
        0.75 - 0.75 * ((minDistance - this.distanceThreshold) / this.distanceThreshold)
      );
    }

    if (minDistance <= this.distanceThreshold) {
      return {
        studentId: bestItem.studentId,
        name: bestItem.name,
        rollNumber: bestItem.rollNumber,
        distance: Number(minDistance.toFixed(4)),
        confidence: Number(confidence.toFixed(4)),
      };
    }

    return {
      studentId: "unknown",
      name: "Unknown Person",
      rollNumber: "—",
      distance: Number(minDistance.toFixed(4)),
      confidence: Number(confidence.toFixed(4)),
    };
  }
}
