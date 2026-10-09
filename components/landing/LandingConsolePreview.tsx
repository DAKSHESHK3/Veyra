"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface RecordItem {
  id: string;
  name: string;
  dept: string;
  roll: string;
  conf: string;
  time: string;
  isNew?: boolean;
}

export function LandingConsolePreview() {
  const [currentTime, setCurrentTime] = useState("10:42:19 AM");
  const [records, setRecords] = useState<RecordItem[]>([
    {
      id: "1",
      name: "Rahul Sharma",
      dept: "CSE / SEC-V",
      roll: "2023-CS-084",
      conf: "98.7%",
      time: "10:41:02 AM",
    },
    {
      id: "2",
      name: "Aman Gupta",
      dept: "CSE / SEC-V",
      roll: "2023-CS-019",
      conf: "99.1%",
      time: "10:41:19 AM",
    },
    {
      id: "3",
      name: "Priya Meena",
      dept: "CSE / SEC-V",
      roll: "2023-CS-114",
      conf: "97.8%",
      time: "10:41:44 AM",
    },
    {
      id: "4",
      name: "Vikram Malhotra",
      dept: "CSE / SEC-V",
      roll: "2023-CS-042",
      conf: "98.2%",
      time: "10:42:01 AM",
    },
  ]);

  const [poolIndex, setPoolIndex] = useState(0);
  const samplePool = [
    { name: "Divya Nair", roll: "2023-CS-067", conf: "99.4%" },
    { name: "Karan Johar", roll: "2023-CS-091", conf: "98.9%" },
    { name: "Ananya Roy", roll: "2023-CS-012", conf: "99.2%" },
    { name: "Siddharth Jain", roll: "2023-CS-055", conf: "97.9%" },
  ];

  const [presentCount, setPresentCount] = useState(38);
  const totalStudents = 42;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSimulateScan = () => {
    if (poolIndex >= samplePool.length) {
      alert("All mock students in pool have been verified and recorded into Postgres RLS.");
      return;
    }
    const student = samplePool[poolIndex];
    setPoolIndex((prev) => prev + 1);
    setPresentCount((prev) => prev + 1);

    const now = new Date().toLocaleTimeString("en-US", { hour12: true });
    const newRecord: RecordItem = {
      id: String(Date.now()),
      name: student.name,
      dept: "CSE / SEC-V",
      roll: student.roll,
      conf: student.conf,
      time: now,
      isNew: true,
    };
    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Student Name,Department,Roll Number,Confidence,Timestamp\n" +
      records.map((r) => `${r.name},${r.dept},${r.roll},${r.conf},${r.time}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `veyra_attendance_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const rate = ((presentCount / totalStudents) * 100).toFixed(1);

  return (
    <section id="console" className="w-full max-w-[1440px] mx-auto px-5 lg:px-12 py-16 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#222220] pb-4 gap-2">
        <div className="space-y-1">
          <span className="font-mono text-[11px] text-[#E3C283] tracking-[0.25em] uppercase">
            [ INTERACTIVE TELEMETRY ]
          </span>
          <h2 className="font-sans text-2xl md:text-3xl text-[#ffffff] tracking-tight font-light">
            ENTERPRISE ATTENDANCE CONSOLE
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E3C283] animate-pulse" />
          <span className="font-mono text-[11px] text-[#E3C283] tracking-[0.14em] uppercase">
            LIVE SESSION TRANSMISSION
          </span>
        </div>
      </div>

      {/* Live Console Chassis */}
      <div className="border border-[#222220] bg-[#0E0E0E] overflow-hidden">
        {/* Console Header Bar */}
        <div className="p-4 bg-[#131313] border-b border-[#222220] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="font-mono text-[11px] text-[#ffffff] font-bold">
              DATABASE SYSTEMS // CS-402
            </div>
            <span className="text-[#929189]">•</span>
            <div className="font-mono text-[11px] text-[#C9C7BD]">HALL B — PODIUM 04</div>
            <span className="text-[#929189]">•</span>
            <div className="font-mono text-[11px] text-[#E3C283]">{currentTime}</div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] text-[#929189] uppercase">REGISTERED:</span>
              <span className="font-mono text-[11px] text-[#ffffff] font-bold">
                {totalStudents}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] text-[#929189] uppercase">PRESENT:</span>
              <span className="font-mono text-[11px] text-[#E3C283] font-bold">{presentCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] text-[#929189] uppercase">RATE:</span>
              <span className="font-mono text-[11px] text-[#ffffff] font-bold">{rate}%</span>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-[#222220] bg-[#1C1B1B] text-[#929189] text-[10px] uppercase tracking-[0.18em]">
                <th className="py-3 px-4 font-normal">STUDENT RECORD</th>
                <th className="py-3 px-4 font-normal">DEPARTMENT / SECTION</th>
                <th className="py-3 px-4 font-normal">ROLL IDENTIFIER</th>
                <th className="py-3 px-4 font-normal">STATUS</th>
                <th className="py-3 px-4 font-normal">CONFIDENCE</th>
                <th className="py-3 px-4 font-normal text-right">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222220]/60">
              {records.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-[#131313] transition-colors ${
                    row.isNew ? "bg-[#5C4612]/20" : ""
                  }`}
                >
                  <td className="py-3 px-4 text-[#ffffff] font-medium flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-[#E3C283] ${
                        row.isNew ? "animate-pulse" : ""
                      }`}
                    />
                    {row.name}
                  </td>
                  <td className="py-3 px-4 text-[#C9C7BD]">{row.dept}</td>
                  <td className="py-3 px-4 text-[#929189] font-mono">{row.roll}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-[#5C4612]/30 border border-[#E3C283]/40 text-[#E3C283] font-mono text-[9px]">
                      {row.isNew ? "VERIFIED (NOW)" : "VERIFIED"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#E3C283] font-mono">{row.conf}</td>
                  <td className="py-3 px-4 text-right text-[#929189] font-mono">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Console Footer Controls */}
        <div className="p-3 bg-[#131313] border-t border-[#222220] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSimulateScan}
              className="h-8 px-4 bg-[#E3C283] text-[#402D00] font-mono text-[11px] uppercase tracking-wider hover:bg-[#FFDEA1] font-bold transition-colors"
            >
              + SIMULATE IN-COMING VERIFICATION
            </button>
            <span className="font-mono text-[9px] text-[#929189]">AUTO-POLLING RLS PIPE</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-[#929189]">
            <button
              type="button"
              onClick={handleExportCSV}
              className="hover:text-[#ffffff] transition-colors uppercase"
            >
              [ EXPORT AUDIT CSV ]
            </button>
            <button
              type="button"
              onClick={() =>
                alert("Session Locked. No further presence entries permitted.")
              }
              className="hover:text-[#FFB4AB] transition-colors uppercase"
            >
              [ LOCK SESSION ]
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
