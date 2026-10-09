"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, BookOpen, BarChart3 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { dbService } from "@/services/db";
import { Subject, AttendanceSession, AttendanceRecord, Student } from "@/types";

export default function SubjectAttendanceReportPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [subs, sess, recs, studs] = await Promise.all([
          dbService.getSubjects(),
          dbService.getAttendanceSessions(),
          dbService.getAllAttendanceRecords(),
          dbService.getStudents(),
        ]);
        setSubjects(subs);
        setSessions(sess);
        setRecords(recs);
        setStudents(studs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const subjectStats = subjects.map((sub) => {
    const courseSessions = sessions.filter((s) => s.subject_id === sub.id);
    const courseSessionIds = new Set(courseSessions.map((s) => s.id));
    const courseRecords = records.filter(
      (r) => courseSessionIds.has(r.session_id) && r.status === "present"
    );
    const cohortStudents = students.filter((st) => st.class_name === sub.class_name);
    const potentialPresents = courseSessions.length * cohortStudents.length;
    const rate =
      potentialPresents > 0
        ? Math.round((courseRecords.length / potentialPresents) * 100)
        : 100;

    return {
      subject: sub,
      sessionCount: courseSessions.length,
      enrolledCount: cohortStudents.length,
      verifiedPresences: courseRecords.length,
      rate,
    };
  });

  const handleExportCSV = () => {
    const rows = [["SUBJECT_CODE", "SUBJECT_NAME", "CLASS", "SESSIONS", "ENROLLED", "VERIFIED_PRESENCES", "ATTENDANCE_RATE"]];
    subjectStats.forEach((s) => {
      rows.push([
        s.subject.code,
        s.subject.name,
        s.subject.class_name,
        String(s.sessionCount),
        String(s.enrolledCount),
        String(s.verifiedPresences),
        `${s.rate}%`,
      ]);
    });

    const csv = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `veyra_subjects_report_${new Date().toISOString().split("T")[0]}.csv`;
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
              <span className="text-[#E3C283] uppercase">COURSE ANALYTICS</span>
            </div>
            <h1 className="text-2xl font-light text-[#F3F0E8] tracking-tight">
              Subject Attendance Report
            </h1>
          </div>

          <Button
            variant="champagne"
            size="sm"
            onClick={handleExportCSV}
            className="font-mono text-xs uppercase"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> EXPORT CSV
          </Button>
        </div>

        <div className="border border-[#222220] bg-[#0E0E0E]">
          <div className="p-4 border-b border-[#222220] flex items-center justify-between font-mono text-xs text-[#F3F0E8] uppercase tracking-wider">
            <span>REGISTERED ACADEMIC COURSES ({subjectStats.length})</span>
          </div>

          {loading ? (
            <div className="py-20 text-center font-mono text-xs text-[#9A9A94] uppercase tracking-widest">
              COMPUTING COURSE AGGREGATES...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#222220] bg-[#131313] text-[#9A9A94] text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4">CODE</th>
                    <th className="py-3 px-4">COURSE NAME</th>
                    <th className="py-3 px-4">CLASS / SECTION</th>
                    <th className="py-3 px-4">SESSIONS HELD</th>
                    <th className="py-3 px-4">STUDENTS</th>
                    <th className="py-3 px-4">AVERAGE PRESENCE</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222220]">
                  {subjectStats.map((item) => (
                    <tr key={item.subject.id} className="hover:bg-[#131313]/50 transition-colors">
                      <td className="py-3 px-4 text-[#E3C283] font-bold">[{item.subject.code}]</td>
                      <td className="py-3 px-4 font-sans text-sm text-[#F3F0E8]">
                        <Link
                          href={`/subjects/${item.subject.id}`}
                          className="hover:text-[#E3C283] transition-colors"
                        >
                          {item.subject.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-[#C9C7BD]">{item.subject.class_name}</td>
                      <td className="py-3 px-4 text-[#C9C7BD]">{item.sessionCount}</td>
                      <td className="py-3 px-4 text-[#9A9A94]">{item.enrolledCount}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 border border-[#E3C283]/40 bg-[#5C4612]/20 text-[#E3C283] text-[10px] font-bold">
                          {item.rate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/subjects/${item.subject.id}`}
                          className="text-[#E3C283] hover:underline text-[10px] uppercase"
                        >
                          COURSE ROSTER &rarr;
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
