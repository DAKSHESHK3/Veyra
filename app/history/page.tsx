"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  History,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dbService } from "@/services/db";
import { AttendanceRecord, AttendanceSession, Subject, Student } from "@/types";
import { formatDateTime } from "@/lib/utils";

export default function HistoryPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("ALL");
  const [filterClass, setFilterClass] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    async function load() {
      try {
        const [recs, sess, subs, studs] = await Promise.all([
          dbService.getAllAttendanceRecords(),
          dbService.getAttendanceSessions(),
          dbService.getSubjects(),
          dbService.getStudents(),
        ]);
        setRecords(recs);
        setSessions(sess);
        setSubjects(subs);
        setStudents(studs);
      } catch (err) {
        console.error("Error loading historical ledger:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const sessionMap = new Map(sessions.map((s) => [s.id, s]));

  const enrichedRecords = records.map((r) => {
    const s = sessionMap.get(r.session_id);
    return {
      ...r,
      session: s,
      subject: s?.subject || subjects.find((sub) => sub.id === s?.subject_id),
    };
  });

  const filtered = enrichedRecords
    .filter((r) => {
      const studentName = r.student?.full_name || "";
      const rollNum = r.student?.roll_number || "";
      const matchesSearch =
        studentName.toLowerCase().includes(search.toLowerCase()) ||
        rollNum.toLowerCase().includes(search.toLowerCase());

      const matchesSub =
        filterSubject === "ALL" || r.session?.subject_id === filterSubject;
      const matchesClass =
        filterClass === "ALL" || r.student?.class_name === filterClass;
      const matchesStatus =
        filterStatus === "ALL" || r.status === filterStatus;

      return matchesSearch && matchesSub && matchesClass && matchesStatus;
    })
    .sort((a, b) => {
      const tA = new Date(a.marked_at).getTime();
      const tB = new Date(b.marked_at).getTime();
      return sortOrder === "desc" ? tB - tA : tA - tB;
    });

  const handleExportCSV = () => {
    const rows = [
      ["RECORD_ID", "TIMESTAMP", "STUDENT_NAME", "ROLL", "CLASS", "SUBJECT", "CONFIDENCE", "STATUS", "SESSION_ID"],
    ];

    filtered.forEach((r) => {
      rows.push([
        r.id,
        r.marked_at,
        r.student?.full_name || "N/A",
        r.student?.roll_number || "N/A",
        r.student?.class_name || "N/A",
        r.subject?.code || "N/A",
        `${(r.confidence * 100).toFixed(1)}%`,
        r.status,
        r.session_id,
      ]);
    });

    const csv = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `veyra_attendance_history_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const classes = ["ALL", ...Array.from(new Set(students.map((s) => s.class_name)))];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222220] pb-6">
          <div>
            <div className="font-mono text-[10px] text-[#E3C283] uppercase tracking-[0.25em] mb-1 flex items-center gap-2">
              <History className="w-3.5 h-3.5" />
              CHRONOLOGICAL AUDIT ARCHIVE
            </div>
            <h1 className="text-2xl font-light text-[#F3F0E8] tracking-tight">
              Biometric Presence History
            </h1>
            <p className="text-xs text-[#9A9A94] mt-1 font-mono">
              Immutable ledger of temporally-verified attendance transactions.
            </p>
          </div>

          <Button
            variant="champagne"
            size="sm"
            onClick={handleExportCSV}
            className="font-mono text-xs uppercase"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> EXPORT AUDIT LOG
          </Button>
        </div>

        {/* Filters Grid */}
        <div className="border border-[#222220] bg-[#0E0E0E] p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Input
                type="text"
                placeholder="SEARCH STUDENT / ROLL //"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#131313] border-[#222220] text-xs font-mono text-[#F3F0E8] focus:border-[#E3C283]"
              />
            </div>

            <div>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full bg-[#131313] border border-[#222220] px-3 py-2 text-xs font-mono text-[#F3F0E8] focus:border-[#E3C283]"
              >
                <option value="ALL">ALL SUBJECTS</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full bg-[#131313] border border-[#222220] px-3 py-2 text-xs font-mono text-[#F3F0E8] focus:border-[#E3C283]"
              >
                {classes.map((c) => (
                  <option key={c} value={c}>
                    {c === "ALL" ? "ALL SECTIONS" : `SECTION: ${c}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                className="w-full bg-[#131313] border border-[#222220] hover:border-[#474740] px-3 py-2 text-xs font-mono text-[#C9C7BD] flex items-center justify-between"
              >
                <span>ORDER: {sortOrder === "desc" ? "LATEST FIRST" : "EARLIEST FIRST"}</span>
                <ArrowUpDown className="w-3.5 h-3.5 text-[#E3C283]" />
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="border border-[#222220] bg-[#0E0E0E]">
          <div className="p-4 border-b border-[#222220] flex items-center justify-between font-mono text-xs text-[#F3F0E8] uppercase tracking-wider">
            <span>VERIFIED TRANSACTIONS ({filtered.length} EVENTS)</span>
            <span className="text-[10px] text-[#9A9A94]">POSTGRES AUDIT SHARD</span>
          </div>

          {loading ? (
            <div className="py-20 text-center font-mono text-xs text-[#9A9A94] uppercase tracking-widest">
              HYDRATING VERIFICATION TIMELINE...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center font-mono text-xs text-[#9A9A94]">
              NO HISTORICAL PRESENCE EVENTS MATCH CURRENT FILTER
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#222220] bg-[#131313] text-[#9A9A94] text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4">TIMESTAMP</th>
                    <th className="py-3 px-4">STUDENT IDENTITY</th>
                    <th className="py-3 px-4">ROLL</th>
                    <th className="py-3 px-4">COURSE</th>
                    <th className="py-3 px-4">CONFIDENCE</th>
                    <th className="py-3 px-4">STATE</th>
                    <th className="py-3 px-4 text-right">SESSION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222220]">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-[#131313]/50 transition-colors">
                      <td className="py-3 px-4 text-[#9A9A94]">
                        {formatDateTime(r.marked_at)}
                      </td>
                      <td className="py-3 px-4 font-sans text-sm text-[#F3F0E8]">
                        <Link
                          href={`/students/${r.student_id}`}
                          className="hover:text-[#E3C283] transition-colors"
                        >
                          {r.student?.full_name || "Unknown"}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-[#C9C7BD]">{r.student?.roll_number || "—"}</td>
                      <td className="py-3 px-4 text-[#E3C283]">
                        [{r.subject?.code || "SESSION"}]
                      </td>
                      <td className="py-3 px-4 text-[#F3F0E8]">
                        {(r.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#E3C283]/40 bg-[#5C4612]/20 text-[#E3C283] text-[10px] uppercase">
                          <CheckCircle2 className="w-3 h-3 text-[#E3C283]" />
                          VERIFIED
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/attendance/${r.session_id}/results`}
                          className="text-[#9A9A94] hover:text-[#E3C283] text-[10px] uppercase"
                        >
                          SESSION AUDIT &rarr;
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
