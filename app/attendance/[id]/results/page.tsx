"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Download,
  Lock,
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  Users,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dbService } from "@/services/db";
import { AttendanceSession, AttendanceRecord, Student } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function SessionResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;

  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [sess, recs, studs] = await Promise.all([
          dbService.getAttendanceSessionById(sessionId),
          dbService.getAttendanceRecords(sessionId),
          dbService.getStudents(),
        ]);
        setSession(sess);
        setRecords(recs);
        setAllStudents(studs);
      } catch (err) {
        console.error("Failed loading session audit results:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sessionId]);

  const handleLockSession = async () => {
    if (!session || session.status === "completed") return;
    setLocking(true);
    try {
      await dbService.endAttendanceSession(sessionId);
      const updated = await dbService.getAttendanceSessionById(sessionId);
      setSession(updated);
    } catch (err) {
      console.error("Lock error:", err);
    } finally {
      setLocking(false);
    }
  };

  const handleExportCSV = () => {
    if (!session) return;
    const presentIds = new Set(records.map((r) => r.student_id));
    const enrolledStudents = allStudents.filter(
      (s) => !session.class_name || s.class_name === session.class_name
    );

    const rows = [
      [
        "STUDENT_NAME",
        "ROLL_NUMBER",
        "CLASS",
        "STATUS",
        "CONFIDENCE",
        "VERIFIED_AT",
        "SESSION_ID",
      ],
    ];

    enrolledStudents.forEach((st) => {
      const rec = records.find((r) => r.student_id === st.id);
      rows.push([
        st.full_name,
        st.roll_number,
        st.class_name,
        rec ? "PRESENT" : "ABSENT",
        rec ? `${(rec.confidence * 100).toFixed(1)}%` : "N/A",
        rec ? rec.marked_at : "N/A",
        session.id,
      ]);
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `veyra_audit_${session.subject?.code || "SESSION"}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="py-24 text-center font-mono text-xs text-[#9A9A94] uppercase tracking-widest">
          QUERYING POSTGRES ATTENDANCE AUDIT LEDGER...
        </div>
      </AppLayout>
    );
  }

  if (!session) {
    return (
      <AppLayout>
        <div className="py-24 text-center">
          <p className="font-mono text-sm text-[#C9C7BD] mb-4">
            SESSION RECORD NOT FOUND IN ARCHIVE
          </p>
          <Link
            href="/attendance"
            className="font-mono text-xs text-[#E3C283] hover:underline"
          >
            &larr; RETURN TO SESSIONS DIRECTORY
          </Link>
        </div>
      </AppLayout>
    );
  }

  const enrolledStudents = allStudents.filter(
    (s) => !session.class_name || s.class_name === session.class_name
  );
  const presentCount = records.length;
  const totalCount = enrolledStudents.length || presentCount;
  const absentCount = Math.max(0, totalCount - presentCount);
  const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[#222220] pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/attendance"
              className="text-[#9A9A94] hover:text-[#E3C283] font-mono text-xs flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> SESSIONS
            </Link>
            <span className="text-[#474740] font-mono text-xs">/</span>
            <span className="font-mono text-xs text-[#F3F0E8] uppercase tracking-wider">
              {session.id.slice(0, 12)} {"//"} RESULTS & AUDIT
            </span>
          </div>

          <div className="flex items-center gap-3">
            {session.status === "active" ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLockSession}
                disabled={locking}
                className="h-8 px-3 text-[10px] font-mono uppercase"
              >
                <Lock className="w-3 h-3 mr-1.5" />
                {locking ? "LOCKING..." : "LOCK SESSION"}
              </Button>
            ) : (
              <span className="font-mono text-[10px] uppercase border border-[#474740] px-2.5 py-1 text-[#9A9A94] bg-[#0E0E0E]">
                ● SESSION LOCKED & ARCHIVED
              </span>
            )}

            <Button
              variant="champagne"
              size="sm"
              onClick={handleExportCSV}
              className="h-8 px-3 text-[10px] font-mono uppercase"
            >
              <Download className="w-3 h-3 mr-1.5" /> EXPORT AUDIT CSV
            </Button>
          </div>
        </div>

        {/* Hero Summary Grid */}
        <div className="border border-[#222220] bg-[#0E0E0E] p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#222220] pb-6 mb-6">
            <div>
              <div className="font-mono text-[10px] uppercase text-[#E3C283] tracking-widest mb-1 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                POST-VERIFICATION AUDIT CERTIFICATE
              </div>
              <h1 className="text-2xl font-light text-[#F3F0E8] tracking-tight">
                {session.subject?.name || "Attendance Verification Session"}
              </h1>
              <div className="font-mono text-xs text-[#9A9A94] mt-1 flex flex-wrap gap-4">
                <span>CODE: {session.subject?.code || "N/A"}</span>
                <span>CLASS: {session.class_name || "ALL"}</span>
                <span>ROOM: {session.room || "MAIN HALL"}</span>
                <span>DATE: {formatDate(session.started_at)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href={`/attendance/${session.id}/live`}
                className="border border-[#474740] bg-[#131313] hover:border-[#E3C283] px-4 py-2 text-xs font-mono text-[#F3F0E8] uppercase tracking-wider transition-colors inline-flex items-center gap-2"
              >
                <Eye className="w-3.5 h-3.5 text-[#E3C283]" />
                OPEN LIVE CONSOLE
              </Link>
            </div>
          </div>

          {/* Metric Quad */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-[#222220] bg-[#131313] p-4">
              <div className="font-mono text-[10px] uppercase text-[#9A9A94] tracking-wider mb-1">
                REGISTERED
              </div>
              <div className="font-mono text-2xl text-[#F3F0E8]">{totalCount}</div>
            </div>
            <div className="border border-[#222220] bg-[#131313] p-4">
              <div className="font-mono text-[10px] uppercase text-[#9A9A94] tracking-wider mb-1">
                PRESENT
              </div>
              <div className="font-mono text-2xl text-[#E3C283]">{presentCount}</div>
            </div>
            <div className="border border-[#222220] bg-[#131313] p-4">
              <div className="font-mono text-[10px] uppercase text-[#9A9A94] tracking-wider mb-1">
                ABSENT
              </div>
              <div className="font-mono text-2xl text-[#9A9A94]">{absentCount}</div>
            </div>
            <div className="border border-[#222220] bg-[#131313] p-4">
              <div className="font-mono text-[10px] uppercase text-[#9A9A94] tracking-wider mb-1">
                VERIFIED RATE
              </div>
              <div className="font-mono text-2xl text-[#E3C283]">{rate}%</div>
            </div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="border border-[#222220] bg-[#0E0E0E]">
          <div className="p-4 border-b border-[#222220] flex items-center justify-between">
            <div className="font-mono text-xs uppercase tracking-wider text-[#F3F0E8]">
              VERIFIED PRESENCE RECORDS ({enrolledStudents.length} ENROLLED)
            </div>
            <div className="font-mono text-[10px] text-[#9A9A94] uppercase">
              128-D TEMPORAL DISTANCE &le; 0.50
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#222220] bg-[#131313] text-[#9A9A94] text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">STUDENT</th>
                  <th className="py-3 px-4">ROLL</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">CONFIDENCE</th>
                  <th className="py-3 px-4">VERIFIED TIME</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222220]">
                {enrolledStudents.map((st) => {
                  const record = records.find((r) => r.student_id === st.id);
                  const isPresent = !!record;

                  return (
                    <tr
                      key={st.id}
                      className="hover:bg-[#131313]/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-sans text-sm text-[#F3F0E8]">
                        <Link
                          href={`/students/${st.id}`}
                          className="hover:text-[#E3C283] transition-colors"
                        >
                          {st.full_name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-[#C9C7BD]">{st.roll_number}</td>
                      <td className="py-3 px-4">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#E3C283]/40 bg-[#5C4612]/20 text-[#E3C283] text-[10px] uppercase">
                            <CheckCircle2 className="w-3 h-3 text-[#E3C283]" />
                            PRESENT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#474740]/40 bg-[#131313] text-[#9A9A94] text-[10px] uppercase">
                            <XCircle className="w-3 h-3 text-[#9A9A94]" />
                            ABSENT
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#C9C7BD]">
                        {record
                          ? `${(record.confidence * 100).toFixed(1)}%`
                          : "—"}
                      </td>
                      <td className="py-3 px-4 text-[#9A9A94]">
                        {record ? formatDateTime(record.marked_at) : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/students/${st.id}`}
                          className="text-[#E3C283] hover:underline text-[10px] uppercase"
                        >
                          VIEW PROFILE &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
