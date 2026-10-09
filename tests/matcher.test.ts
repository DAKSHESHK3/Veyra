import { describe, it, expect } from "vitest";
import {
  euclideanDistance,
  cosineSimilarity,
  computeEmbeddingCentroid,
  FaceMatcher,
} from "../lib/face-recognition/matcher";

describe("Biometric Vector Matching", () => {
  it("calculates zero distance for identical vectors", () => {
    const v1 = new Float32Array(128).fill(0.1);
    const v2 = new Float32Array(128).fill(0.1);
    expect(euclideanDistance(v1, v2)).toBe(0);
  });

  it("calculates expected euclidean distance and cosine similarity", () => {
    const v1 = new Float32Array([1, 0, 0]);
    const v2 = new Float32Array([0, 1, 0]);
    expect(euclideanDistance(v1, v2)).toBeCloseTo(Math.SQRT2, 5);
    expect(cosineSimilarity(v1, v2)).toBeCloseTo(0, 5);

    const v3 = new Float32Array([1, 0, 0]);
    expect(cosineSimilarity(v1, v3)).toBeCloseTo(1, 5);
  });

  it("computes normalized centroid from multiple sample vectors", () => {
    const samples = [
      new Float32Array([1, 0, 0]),
      new Float32Array([0, 1, 0]),
    ];
    const centroid = computeEmbeddingCentroid(samples);
    expect(centroid.length).toBe(3);
    expect(centroid[0]).toBeCloseTo(Math.SQRT1_2, 3);
    expect(centroid[1]).toBeCloseTo(Math.SQRT1_2, 3);
    expect(centroid[2]).toBe(0);
  });

  it("finds enrolled student when distance is within threshold", () => {
    const enrolledItem = {
      studentId: "stu-1",
      name: "Rahul Sharma",
      rollNumber: "1",
      embedding: new Float32Array(128).fill(0.2),
    };

    const matcher = new FaceMatcher([enrolledItem], 0.55);

    // Query close to enrolled
    const queryClose = new Float32Array(128).fill(0.205);
    const match = matcher.findBestMatch(queryClose);

    expect(match).not.toBeNull();
    expect(match?.studentId).toBe("stu-1");
    expect(match?.name).toBe("Rahul Sharma");
    expect(match?.confidence).toBeGreaterThan(0.8);
  });

  it("identifies unknown face when distance exceeds threshold", () => {
    const enrolledItem = {
      studentId: "stu-1",
      name: "Rahul Sharma",
      rollNumber: "1",
      embedding: new Float32Array(128).fill(0.1),
    };

    const matcher = new FaceMatcher([enrolledItem], 0.40);

    // Query far from enrolled
    const queryFar = new Float32Array(128).fill(0.9);
    const match = matcher.findBestMatch(queryFar);

    expect(match).not.toBeNull();
    expect(match?.studentId).toBe("unknown");
    expect(match?.name).toBe("Unknown Person");
  });
});
