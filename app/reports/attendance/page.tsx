"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Filter, Calendar, Clock, BookOpen, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { dbService } from "@/services/db";
import { AttendanceSession, Subject, AttendanceRecord } from "@/types";
import { formatDate } from "@/lib/utils";

export default function AttendanceReportPage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubject, setSelectedSubject] = useState("ALL");

  useEffect(() => {
    async function load() {
      try {
        const [sess, subs, recs] = await Promise.all([
          dbService.getAttendanceSessions(),
          dbService.getSubjects(),
          dbService.getAllAttendanceRecords(),
        ]);
        setSessions(sess);
        setSubjects(subs);
        setAllRecords(recs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredSessions = sessions.filter(
    (s) => selectedSubject === "ALL" || s.subject_id === selectedSubject
  );

  const handleExportCSV = () => {
    const rows = [
      ["SESSION_ID", "SUBJECT_CODE", "SUBJECT_NAME", "CLASS", "ROOM", "STATUS", "STARTED_AT", "PRESENT_COUNT"],
    ];

    filteredSessions.forEach((s) => {
      const presCount = allRecords.filter((r) => r.session_id === s.id && r.status === "present").length;
      rows.push([
        s.id,
        s.subject?.code || "N/A",
        s.subject?.name || "N/A",
        s.class_name || "ALL",
        s.room || "MAIN HALL",
        s.status,
        s.started_at,
        String(presCount),
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `veyra_sessions_report_${new Date().toISOString().split("T")[0]}.csv`;
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
              <span className="text-[#E3C283] uppercase">SESSIONS AUDIT</span>
            </div>
            <h1 className="text-2xl font-light text-[#F3F0E8] tracking-tight">
              Attendance Sessions Report
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-[#131313] border border-[#222220] px-3 py-1.5 text-xs font-mono text-[#F3F0E8] focus:border-[#E3C283]"
            >
              <option value="ALL">ALL COURSES</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>

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

        <div className="border border-[#222220] bg-[#0E0E0E]">
          <div className="p-4 border-b border-[#222220] flex items-center justify-between">
            <div className="font-mono text-xs uppercase tracking-wider text-[#F3F0E8]">
              LOGGED SESSIONS ({filteredSessions.length})
            </div>
            <div className="font-mono text-[10px] text-[#9A9A94] uppercase">
              POSTGRES LEDGER
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center font-mono text-xs text-[#9A9A94] uppercase tracking-widest">
              QUERYING SESSION RECORDS...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-20 text-center font-mono text-xs text-[#9A9A94]">
              NO ATTENDANCE SESSIONS RECORDED
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#222220] bg-[#131313] text-[#9A9A94] text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4">COURSE</th>
                    <th className="py-3 px-4">CLASS</th>
                    <th className="py-3 px-4">ROOM</th>
                    <th className="py-3 px-4">DATE</th>
                    <th className="py-3 px-4">VERIFIED PRESENT</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222220]">
                  {filteredSessions.map((s) => {
                    const presentCount = allRecords.filter(
                      (r) => r.session_id === s.id && r.status === "present"
                    ).length;

                    return (
                      <tr key={s.id} className="hover:bg-[#131313]/50 transition-colors">
                        <td className="py-3 px-4 font-sans text-sm text-[#F3F0E8]">
                          {s.subject?.name || "Attendance Session"}
                          <span className="font-mono text-[10px] text-[#E3C283] block">
                            [{s.subject?.code || "N/A"}]
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#C9C7BD]">{s.class_name || "ALL"}</td>
                        <td className="py-3 px-4 text-[#9A9A94]">{s.room || "MAIN HALL"}</td>
                        <td className="py-3 px-4 text-[#C9C7BD]">{formatDate(s.started_at)}</td>
                        <td className="py-3 px-4 text-[#E3C283] font-bold">{presentCount}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 border text-[9px] uppercase ${
                              s.status === "active"
                                ? "bg-[#5C4612]/30 border-[#E3C283] text-[#E3C283]"
                                : "bg-[#131313] border-[#474740] text-[#9A9A94]"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/attendance/${s.id}/results`}
                            className="text-[#E3C283] hover:underline text-[10px] uppercase"
                          >
                            VIEW AUDIT &rarr;
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
