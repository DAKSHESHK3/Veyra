import { RecognitionCandidate } from "@/types";

export interface TemporalVerificationConfig {
  windowSize: number; // Number of recent observations to retain (default: 8)
  requiredMatches: number; // Minimum matches for the same student in the window (default: 5)
  minAverageConfidence: number; // Minimum average confidence threshold (default: 0.65)
}

export class TemporalVerificationEngine {
  private history: Map<string, { timestamp: number; confidence: number }[]> = new Map();
  private verifiedStudents: Set<string> = new Set();
  private config: TemporalVerificationConfig;

  constructor(config?: Partial<TemporalVerificationConfig>) {
    this.config = {
      windowSize: config?.windowSize ?? 8,
      requiredMatches: config?.requiredMatches ?? 5,
      minAverageConfidence: config?.minAverageConfidence ?? 0.65,
    };
  }

  public reset(): void {
    this.history.clear();
    this.verifiedStudents.clear();
  }

  public markAsAlreadyVerified(studentId: string): void {
    this.verifiedStudents.add(studentId);
  }

  public isAlreadyVerified(studentId: string): boolean {
    return this.verifiedStudents.has(studentId);
  }

  /**
   * Submits a recognized candidate frame observation.
   * Returns candidate if verification condition is satisfied and student hasn't been marked yet; otherwise null.
   */
  public processObservation(candidate: RecognitionCandidate): RecognitionCandidate | null {
    if (!candidate || candidate.studentId === "unknown") {
      return null;
    }

    if (this.verifiedStudents.has(candidate.studentId)) {
      return null;
    }

    const now = Date.now();
    let entries = this.history.get(candidate.studentId);
    if (!entries) {
      entries = [];
      this.history.set(candidate.studentId, entries);
    }

    // Append observation
    entries.push({ timestamp: now, confidence: candidate.confidence });

    // Keep only last N items and prune older than 4 seconds
    entries = entries
      .filter((e) => now - e.timestamp < 4000)
      .slice(-this.config.windowSize);
    this.history.set(candidate.studentId, entries);

    // Check verification threshold
    if (entries.length >= this.config.requiredMatches) {
      const avgConfidence =
        entries.reduce((acc, curr) => acc + curr.confidence, 0) / entries.length;

      if (avgConfidence >= this.config.minAverageConfidence) {
        // Mark student as verified!
        this.verifiedStudents.add(candidate.studentId);
        return {
          ...candidate,
          confidence: Number(avgConfidence.toFixed(4)),
        };
      }
    }

    return null;
  }

  public getProgress(studentId: string): number {
    if (this.verifiedStudents.has(studentId)) return 100;
    const entries = this.history.get(studentId) || [];
    return Math.min(100, Math.round((entries.length / this.config.requiredMatches) * 100));
  }
}
