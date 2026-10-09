"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Search, Users, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dbService } from "@/services/db";
import { Student, AttendanceSession, AttendanceRecord } from "@/types";

export default function StudentAttendanceReportPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [stus, sess, recs] = await Promise.all([
          dbService.getStudents(),
          dbService.getAttendanceSessions(),
          dbService.getAllAttendanceRecords(),
        ]);
        setStudents(stus);
        setSessions(sess);
        setRecords(recs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const studentStats = students.map((s) => {
    const studentSessions = sessions.filter(
      (sess) => !sess.class_name || sess.class_name === s.class_name
    );
    const attended = records.filter(
      (r) => r.student_id === s.id && r.status === "present"
    );
    const rate =
      studentSessions.length > 0
        ? Math.round((attended.length / studentSessions.length) * 100)
        : 100;

    return {
      student: s,
      totalSessions: studentSessions.length,
      attendedCount: attended.length,
      rate,
      lastSeen: attended[0]?.marked_at || null,
    };
  });

  const filtered = studentStats.filter(
    (item) =>
      item.student.full_name.toLowerCase().includes(search.toLowerCase()) ||
      item.student.roll_number.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const rows = [["STUDENT_NAME", "ROLL", "CLASS", "TOTAL_SESSIONS", "ATTENDED", "PERCENTAGE", "LAST_SEEN"]];
    filtered.forEach((item) => {
      rows.push([
        item.student.full_name,
        item.student.roll_number,
        item.student.class_name,
        String(item.totalSessions),
        String(item.attendedCount),
        `${item.rate}%`,
        item.lastSeen || "N/A",
      ]);
    });

    const csv = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `veyra_students_report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222220] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#9A9A94] mb-1">
              <Link href="/reports" className="hover:text-[#E3C283] flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> REPORTS
              </Link>
              <span>/</span>
              <span className="text-[#E3C283] uppercase">STUDENT PRESENCE MATRIX</span>
            </div>
            <h1 className="text-2xl font-light text-[#F3F0E8] tracking-tight">
              Student Attendance Matrix
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="champagne"
              size="sm"
              onClick={handleExportCSV}
              className="font-mono text-xs uppercase"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> EXPORT CSV
            </Button>
          </div>
        </div>

        <div className="border border-[#222220] bg-[#0E0E0E] p-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A94]" />
            <Input
              type="text"
              placeholder="FILTER BY NAME OR ROLL //"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#131313] border-[#222220] text-xs font-mono text-[#F3F0E8] focus:border-[#E3C283]"
            />
          </div>
        </div>

        <div className="border border-[#222220] bg-[#0E0E0E]">
          <div className="p-4 border-b border-[#222220] flex items-center justify-between font-mono text-xs">
            <span className="text-[#F3F0E8] uppercase tracking-wider">
              COHORT ATTENDANCE LEDGER ({filtered.length} SUBJECTS)
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center font-mono text-xs text-[#9A9A94] uppercase tracking-widest">
              AGGREGATING BIOMETRIC MATRICES...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#222220] bg-[#131313] text-[#9A9A94] text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4">STUDENT</th>
                    <th className="py-3 px-4">ROLL</th>
                    <th className="py-3 px-4">CLASS</th>
                    <th className="py-3 px-4">SESSIONS HELD</th>
                    <th className="py-3 px-4">ATTENDED</th>
                    <th className="py-3 px-4">PRESENCE RATE</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222220]">
                  {filtered.map((item) => (
                    <tr key={item.student.id} className="hover:bg-[#131313]/50 transition-colors">
                      <td className="py-3 px-4 font-sans text-sm text-[#F3F0E8]">
                        <Link
                          href={`/students/${item.student.id}`}
                          className="hover:text-[#E3C283] transition-colors"
                        >
                          {item.student.full_name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-[#C9C7BD]">{item.student.roll_number}</td>
                      <td className="py-3 px-4 text-[#9A9A94]">{item.student.class_name}</td>
                      <td className="py-3 px-4 text-[#C9C7BD]">{item.totalSessions}</td>
                      <td className="py-3 px-4 text-[#E3C283] font-bold">{item.attendedCount}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 border text-[10px] font-bold ${
                            item.rate >= 75
                              ? "bg-[#5C4612]/30 border-[#E3C283] text-[#E3C283]"
                              : "bg-[#201F1F] border-red-500/40 text-red-400"
                          }`}
                        >
                          {item.rate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/students/${item.student.id}`}
                          className="text-[#E3C283] hover:underline text-[10px] uppercase"
                        >
                          VIEW IDENTITY &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
