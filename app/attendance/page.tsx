"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Camera,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { dbService } from "@/services/db";
import { AttendanceSession } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";

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
    return subName.includes(term) || subCode.includes(term) || s.class_name.toLowerCase().includes(term);
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance Sessions</h1>
            <p className="text-sm text-muted-foreground">
              Monitor active camera rooms and historical lecture attendance logs
            </p>
          </div>
          <Link href="/attendance/new">
            <Button>
              <Camera className="h-4 w-4 mr-2" />
              Start New Session
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter by subject or class..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Card className="border-border/80 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <Calendar className="h-10 w-10 mx-auto text-muted-foreground/60" />
                <p className="text-base font-medium">No sessions found</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {search
                    ? "No sessions matched your filter criteria."
                    : "No attendance sessions have been scheduled yet. Launch the camera room to start tracking."}
                </p>
                <Link href="/attendance/new">
                  <Button size="sm" className="mt-2">
                    Start Attendance Now
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] uppercase tracking-wider text-muted-foreground border-b bg-muted/40">
                    <tr>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Class & Sem</th>
                      <th className="py-3 px-4">Session Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-foreground text-sm">
                            {s.subject?.name || "Lecture Session"}
                          </span>
                          <span className="text-[10px] font-mono ml-2 text-muted-foreground">
                            [{s.subject?.code || "—"}]
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {s.class_name} • {s.semester}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {formatDateTime(s.started_at)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              s.status === "active"
                                ? "success"
                                : s.status === "completed"
                                ? "outline"
                                : "destructive"
                            }
                            className="text-[10px]"
                          >
                            {s.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/attendance/${s.id}`}>
                            <Button size="sm" variant={s.status === "active" ? "default" : "outline"} className="h-7 text-xs">
                              {s.status === "active" ? "Join Camera Room" : "View Logs"}
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
