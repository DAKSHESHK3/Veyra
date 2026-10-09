import { describe, it, expect, beforeEach } from "vitest";
import { TemporalVerificationEngine } from "../lib/face-recognition/temporal";
import { RecognitionCandidate } from "../types";

describe("Temporal Verification Engine", () => {
  let engine: TemporalVerificationEngine;

  beforeEach(() => {
    engine = new TemporalVerificationEngine({
      windowSize: 8,
      requiredMatches: 4,
      minAverageConfidence: 0.7,
    });
  });

  it("does not verify student before reaching required matches threshold", () => {
    const candidate: RecognitionCandidate = {
      studentId: "stu-1",
      name: "Rahul Sharma",
      rollNumber: "1",
      distance: 0.2,
      confidence: 0.9,
    };

    expect(engine.processObservation(candidate)).toBeNull();
    expect(engine.processObservation(candidate)).toBeNull();
    expect(engine.processObservation(candidate)).toBeNull();
  });

  it("verifies student once required matches condition is satisfied", () => {
    const candidate: RecognitionCandidate = {
      studentId: "stu-1",
      name: "Rahul Sharma",
      rollNumber: "1",
      distance: 0.2,
      confidence: 0.92,
    };

    engine.processObservation(candidate);
    engine.processObservation(candidate);
    engine.processObservation(candidate);
    const verified = engine.processObservation(candidate);

    expect(verified).not.toBeNull();
    expect(verified?.studentId).toBe("stu-1");
    expect(verified?.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it("strictly prevents duplicate verification for the same student", () => {
    const candidate: RecognitionCandidate = {
      studentId: "stu-1",
      name: "Rahul Sharma",
      rollNumber: "1",
      distance: 0.2,
      confidence: 0.95,
    };

    // First 4 satisfy verification
    engine.processObservation(candidate);
    engine.processObservation(candidate);
    engine.processObservation(candidate);
    const firstVerification = engine.processObservation(candidate);
    expect(firstVerification).not.toBeNull();

    // Subsequent observations should be ignored/null
    expect(engine.processObservation(candidate)).toBeNull();
    expect(engine.processObservation(candidate)).toBeNull();
    expect(engine.isAlreadyVerified("stu-1")).toBe(true);
  });

  it("rejects unknown person candidates", () => {
    const unknown: RecognitionCandidate = {
      studentId: "unknown",
      name: "Unknown Person",
      rollNumber: "—",
      distance: 0.8,
      confidence: 0.3,
    };

    for (let i = 0; i < 10; i++) {
      expect(engine.processObservation(unknown)).toBeNull();
    }
  });
});
