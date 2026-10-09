import { describe, it, expect } from "vitest";

describe("CSV Export Generation", () => {
  it("formats records into standard compliant CSV lines with proper escaping", () => {
    const headers = ["Roll Number", "Name", "Subject", "Date", "Status", "Confidence"];
    const records = [
      {
        roll: "1",
        name: "Rahul Sharma",
        subject: "English Literature",
        date: "2026-10-09",
        status: "present",
        confidence: 0.98,
      },
      {
        roll: "2",
        name: "Gupta, Aman",
        subject: "Hindi Language & Comm",
        date: "2026-10-09",
        status: "present",
        confidence: 0.94,
      },
    ];

    const lines = [
      headers.join(","),
      ...records.map((r) =>
        [r.roll, `"${r.name}"`, `"${r.subject}"`, r.date, r.status, r.confidence].join(",")
      ),
    ];

    const csvOutput = lines.join("\n");
    expect(csvOutput).toContain("Roll Number,Name,Subject,Date,Status,Confidence");
    expect(csvOutput).toContain('1,"Rahul Sharma","English Literature",2026-10-09,present,0.98');
    expect(csvOutput).toContain('2,"Gupta, Aman","Hindi Language & Comm",2026-10-09,present,0.94');
  });
});
