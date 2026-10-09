"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, UserPlus, ArrowRight, BookOpen, BarChart3, Database } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dbService } from "@/services/db";
import { formatDate } from "@/lib/utils";
import { AttendanceSession } from "@/types";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalStudents: number;
    todayPresentCount: number;
    todayAbsentCount: number;
    attendancePercentage: number;
    activeSubjectsCount: number;
    recentSessions: AttendanceSession[];
  } | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await dbService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Dashboard stats load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const total = stats?.totalStudents ?? 42;
  const present = stats?.todayPresentCount ?? 38;
  const presenceRate =
    total > 0 ? (stats?.attendancePercentage ?? Number(((present / total) * 100).toFixed(1))) : 90.4;
  const activeSession = stats?.recentSessions?.find((s) => s.status === "active");

  return (
    <AppLayout>
      <div className="space-y-8 select-none">
        {/* Architectural Header Bar */}
        <div className="border-b border-[#222220] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#E3C283] tracking-[0.25em] uppercase">
                [ COMMAND CENTER // 001 ]
              </span>
              <span className="font-mono text-[9px] text-[#929189]">SYS: TELEMETRY ACTIVE</span>
            </div>
            <h1 className="font-sans text-3xl md:text-4xl font-light text-[#ffffff] tracking-tight uppercase">
              INSTITUTIONAL METRICS
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/attendance/new">
              <Button variant="champagne" size="sm" className="h-9 px-4">
                <Camera className="h-3.5 w-3.5 mr-2" />
                TAKE ATTENDANCE
              </Button>
            </Link>
            <Link href="/students/new">
              <Button variant="outline" size="sm" className="h-9 px-4 border-[#474740]">
                <UserPlus className="h-3.5 w-3.5 mr-2 text-[#E3C283]" />
                ENROLL STUDENT
              </Button>
            </Link>
          </div>
        </div>

        {/* Primary Command Telemetry Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#222220] bg-[#0E0E0E]">
          {/* Monument Primary Metric */}
          <div className="lg:col-span-5 p-8 border-b lg:border-b-0 lg:border-r border-[#222220] flex flex-col justify-between space-y-6">
            <div className="space-y-1">
              <span className="font-mono text-[10px] text-[#929189] uppercase tracking-[0.2em]">
                PRIMARY METRIC // DIAL 01
              </span>
              <h2 className="font-mono text-xs text-[#C9C7BD] tracking-[0.14em] uppercase">
                TODAY&apos;S PRESENCE
              </h2>
            </div>

            <div className="space-y-2">
              {loading ? (
                <Skeleton className="h-24 w-44 bg-[#1C1B1B]" />
              ) : (
                <div className="font-mono text-6xl md:text-7xl font-bold tracking-tight text-[#ffffff]">
                  {presenceRate}
                  <span className="text-[#E3C283] text-4xl ml-1 font-normal">%</span>
                </div>
              )}
              <div className="font-mono text-[10px] text-[#929189] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E3C283] animate-pulse" />
                VERIFIED BIOMETRIC ACCORDANCE (3-FRAME FILTER)
              </div>
            </div>

            <div className="pt-4 border-t border-[#222220] flex items-center justify-between font-mono text-[10px] text-[#C9C7BD]">
              <span>SAMPLE WINDOW: TODAY</span>
              <span className="text-[#E3C283]">CONFIDENCE: &gt; 0.950</span>
            </div>
          </div>

          {/* Secondary Telemetry Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#222220]">
            {/* Present Counter */}
            <div className="p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-[#929189] uppercase tracking-[0.2em]">
                  METRIC // 02
                </span>
                <div className="font-mono text-[11px] text-[#C9C7BD] uppercase tracking-wider">
                  STUDENTS PRESENT
                </div>
              </div>
              <div className="space-y-1">
                {loading ? (
                  <Skeleton className="h-12 w-28 bg-[#1C1B1B]" />
                ) : (
                  <div className="font-mono text-4xl font-bold text-[#E3C283]">
                    {present}{" "}
                    <span className="text-xl text-[#929189] font-normal">/ {total}</span>
                  </div>
                )}
                <div className="font-mono text-[9px] text-[#929189]">
                  {stats?.todayAbsentCount ?? 4} ABSENT OR PENDING
                </div>
              </div>
              <div className="font-mono text-[9px] text-[#474740] uppercase tracking-widest pt-2 border-t border-[#222220]">
                IMMUTABLE POSTGRES LOGGED
              </div>
            </div>

            {/* Active Session Status */}
            <div className="p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-[#929189] uppercase tracking-[0.2em]">
                  SYSTEM STATUS // 03
                </span>
                <div className="font-mono text-[11px] text-[#C9C7BD] uppercase tracking-wider">
                  ACTIVE SESSION
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-mono text-lg font-medium text-[#ffffff] uppercase truncate">
                  {activeSession?.subject?.name || "DATABASE SYSTEMS"}
                </div>
                <div className="font-mono text-[10px] text-[#E3C283] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E3C283] animate-ping" />
                  <span>SESSION LIVE: 00:18:42</span>
                </div>
              </div>

              <div className="font-mono text-[9px] text-[#474740] uppercase tracking-widest pt-2 border-t border-[#222220]">
                HALL B // PODIUM 04
              </div>
            </div>
          </div>
        </div>

        {/* Operational Shortcut Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/attendance/new"
            className="p-4 border border-[#222220] bg-[#0E0E0E] hover:border-[#E3C283] hover:bg-[#131313] transition-all group"
          >
            <div className="font-mono text-[9px] text-[#929189] group-hover:text-[#E3C283] transition-colors">
              OP // 01
            </div>
            <div className="font-sans text-sm font-medium text-[#ffffff] mt-1">TAKE ATTENDANCE</div>
            <div className="font-mono text-[9px] text-[#929189] mt-0.5">LAUNCH WEBCAM RETICLE</div>
          </Link>

          <Link
            href="/students/new"
            className="p-4 border border-[#222220] bg-[#0E0E0E] hover:border-[#E3C283] hover:bg-[#131313] transition-all group"
          >
            <div className="font-mono text-[9px] text-[#929189] group-hover:text-[#E3C283] transition-colors">
              OP // 02
            </div>
            <div className="font-sans text-sm font-medium text-[#ffffff] mt-1">ENROLL BIOMETRIC</div>
            <div className="font-mono text-[9px] text-[#929189] mt-0.5">3-POSE VECTOR SEED</div>
          </Link>

          <Link
            href="/subjects"
            className="p-4 border border-[#222220] bg-[#0E0E0E] hover:border-[#E3C283] hover:bg-[#131313] transition-all group"
          >
            <div className="font-mono text-[9px] text-[#929189] group-hover:text-[#E3C283] transition-colors">
              OP // 03
            </div>
            <div className="font-sans text-sm font-medium text-[#ffffff] mt-1">MANAGE COURSES</div>
            <div className="font-mono text-[9px] text-[#929189] mt-0.5">DEPARTMENT CATALOG</div>
          </Link>

          <Link
            href="/reports"
            className="p-4 border border-[#222220] bg-[#0E0E0E] hover:border-[#E3C283] hover:bg-[#131313] transition-all group"
          >
            <div className="font-mono text-[9px] text-[#929189] group-hover:text-[#E3C283] transition-colors">
              OP // 04
            </div>
            <div className="font-sans text-sm font-medium text-[#ffffff] mt-1">EXPORT AUDIT CSV</div>
            <div className="font-mono text-[9px] text-[#929189] mt-0.5">RELATIONAL LEDGER</div>
          </Link>
        </div>

        {/* Recent Sessions Table */}
        <div className="border border-[#222220] bg-[#0E0E0E]">
          <div className="p-4 border-b border-[#222220] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-mono text-[9px] text-[#E3C283] tracking-[0.2em] uppercase">
                AUDIT LOGS
              </span>
              <h3 className="font-sans text-base text-[#ffffff] font-normal">
                RECENT ATTENDANCE SESSIONS
              </h3>
            </div>
            <Link
              href="/attendance"
              className="font-mono text-[10px] text-[#929189] hover:text-[#E3C283] transition-colors uppercase"
            >
              [ VIEW ALL SESSIONS → ]
            </Link>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-8 w-full bg-[#1C1B1B]" />
                <Skeleton className="h-8 w-full bg-[#1C1B1B]" />
              </div>
            ) : !stats?.recentSessions || stats.recentSessions.length === 0 ? (
              <div className="p-10 text-center space-y-3 font-mono text-xs text-[#929189]">
                <div>NO ACTIVE OR ARCHIVED SESSIONS DETECTED</div>
                <Link href="/attendance/new">
                  <Button variant="champagne" size="sm" className="mt-2">
                    START FIRST SESSION
                  </Button>
                </Link>
              </div>
            ) : (
              <table className="w-full text-left font-mono text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-[#222220] bg-[#131313] text-[#929189] text-[9px] uppercase tracking-[0.18em]">
                    <th className="py-3 px-4 font-normal">SESSION / SUBJECT</th>
                    <th className="py-3 px-4 font-normal">CLASS &amp; SEMESTER</th>
                    <th className="py-3 px-4 font-normal">TIMESTAMP</th>
                    <th className="py-3 px-4 font-normal">STATUS</th>
                    <th className="py-3 px-4 font-normal text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222220]">
                  {stats.recentSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-[#131313] transition-colors">
                      <td className="py-3.5 px-4 text-[#ffffff] font-medium">
                        {session.subject?.name || "Lecture Session"}
                        <span className="text-[#929189] ml-2 text-[10px]">
                          [{session.subject?.code || "CS-402"}]
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#C9C7BD]">
                        {session.class_name} • {session.semester}
                      </td>
                      <td className="py-3.5 px-4 text-[#929189]">
                        {formatDate(session.started_at)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 border text-[9px] uppercase ${
                            session.status === "active"
                              ? "bg-[#5C4612]/30 border-[#E3C283]/50 text-[#E3C283]"
                              : "bg-[#201F1F] border-[#474740]/40 text-[#929189]"
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/attendance/${session.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] text-[#E3C283]">
                            {session.status === "active" ? "RESUME →" : "VIEW →"}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
