"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { dbService } from "@/services/db";
import { AttendanceSession } from "@/types";
import { formatDate } from "@/lib/utils";

export default function AttendanceSessionsListPage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSessions = async () => {
    try {
      const data = await dbService.getAttendanceSessions();
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filtered = sessions.filter((s) => {
    const subName = s.subject?.name?.toLowerCase() || "";
    const subCode = s.subject?.code?.toLowerCase() || "";
    const term = search.toLowerCase();
    return (
      subName.includes(term) || subCode.includes(term) || s.class_name.toLowerCase().includes(term)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6 select-none max-w-7xl mx-auto">
        {/* Header Horizon */}
        <div className="border-b border-[#222220] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-[#E3C283] tracking-[0.25em] uppercase">
              [ WEBCAM SESSIONS // 005 ]
            </span>
            <h1 className="font-sans text-2xl md:text-3xl font-light text-[#ffffff] uppercase tracking-tight">
              ATTENDANCE ROOMS
            </h1>
            <p className="font-mono text-xs text-[#929189]">
              Active real-time verification sessions and historically archived lectures
            </p>
          </div>

          <Link href="/attendance/new">
            <Button variant="champagne" size="sm" className="h-9 px-4 font-bold">
              <Camera className="h-3.5 w-3.5 mr-2" />
              NEW CAMERA ROOM →
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#929189]" />
            <Input
              placeholder="SEARCH BY COURSE NAME, CODE, OR CLASS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-[11px]"
            />
          </div>
        </div>

        {/* Sessions Table */}
        <div className="border border-[#222220] bg-[#0E0E0E]">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-[#222220] bg-[#131313] text-[#929189] text-[9px] uppercase tracking-[0.18em]">
                  <th className="py-3 px-4 font-normal">COURSE / LECTURE</th>
                  <th className="py-3 px-4 font-normal">DEPARTMENT / SECTION</th>
                  <th className="py-3 px-4 font-normal">STARTED AT</th>
                  <th className="py-3 px-4 font-normal">SESSION STATE</th>
                  <th className="py-3 px-4 font-normal text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222220]/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-6">
                      <div className="space-y-3">
                        <Skeleton className="h-8 w-full bg-[#1C1B1B]" />
                        <Skeleton className="h-8 w-full bg-[#1C1B1B]" />
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-[#929189] font-mono text-xs">
                      NO ACTIVE OR PAST SESSIONS FOUND
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-[#131313] hover:border-l-2 hover:border-l-[#E3C283] transition-all"
                    >
                      <td className="py-3.5 px-4 text-[#ffffff] font-medium">
                        {s.subject?.name || "Lecture Session"}
                        <span className="text-[#929189] ml-2 text-[10px]">
                          [{s.subject?.code || "CS-402"}]
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#C9C7BD]">
                        {s.class_name} • {s.semester}
                      </td>
                      <td className="py-3.5 px-4 text-[#929189]">
                        {formatDate(s.started_at)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 border text-[9px] uppercase ${
                            s.status === "active"
                              ? "bg-[#5C4612]/30 border-[#E3C283]/50 text-[#E3C283]"
                              : "bg-[#201F1F] border-[#474740]/40 text-[#929189]"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/attendance/${s.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] text-[#E3C283]">
                            {s.status === "active" ? "RESUME RETICLE →" : "VIEW LEDGER →"}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
