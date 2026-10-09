"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  Users,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dbService } from "@/services/db";
import { Student, Subject, AttendanceSession, AttendanceRecord } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);

  // Filter States
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");

  useEffect(() => {
    async function loadData() {
      try {
        const [stuList, subList, sessList] = await Promise.all([
          dbService.getStudents(),
          dbService.getSubjects(),
          dbService.getAttendanceSessions(),
        ]);
        setStudents(stuList);
        setSubjects(subList);
        setSessions(sessList);

        // Fetch records across sessions
        const recordsAccum: AttendanceRecord[] = [];
        for (const s of sessList) {
          const recs = await dbService.getAttendanceRecords(s.id);
          recordsAccum.push(...recs);
        }
        setAllRecords(recordsAccum);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesSubject = selectedSubjectId === "all" || s.subject_id === selectedSubjectId;
    const matchesClass = selectedClass === "all" || s.class_name === selectedClass;
    return matchesSubject && matchesClass;
  });

  const filteredSessionIds = new Set(filteredSessions.map((s) => s.id));
  const filteredRecords = allRecords.filter((r) => filteredSessionIds.has(r.session_id));

  const totalSessionsCount = filteredSessions.length;
  const totalVerifiedPresents = filteredRecords.filter((r) => r.status === "present").length;
  const totalClassRoster = students.filter((s) => selectedClass === "all" || s.class_name === selectedClass).length;
  const potentialTotal = totalSessionsCount * (totalClassRoster || 1);
  const overallRate = potentialTotal > 0 ? Math.round((totalVerifiedPresents / potentialTotal) * 100) : 0;

  // Real CSV Export
  const handleExportAllCSV = () => {
    const headers = ["Roll Number", "Name", "Subject", "Date", "Status", "Confidence"];
    const rows = filteredRecords.map((r) => {
      const parentSession = sessions.find((s) => s.id === r.session_id);
      const subName = parentSession?.subject?.name || "Lecture";
      const dateStr = parentSession?.started_at ? parentSession.started_at.split("T")[0] : "date";
      return [
        r.student?.roll_number || "—",
        `"${r.student?.full_name || "Unknown"}"`,
        `"${subName}"`,
        dateStr,
        r.status,
        r.confidence,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Master_Attendance_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const classes = Array.from(new Set(students.map((s) => s.class_name)));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance Analytics & Reports</h1>
            <p className="text-sm text-muted-foreground">
              Audit lecture history, calculate aggregated percentages, and export CSV logs
            </p>
          </div>
          <Button onClick={handleExportAllCSV} disabled={filteredRecords.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Complete CSV
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-border/80 bg-card shadow-sm text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background/50 px-3 text-xs"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background/50 px-3 text-xs"
          >
            <option value="all">All Classes</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{totalSessionsCount}</div>}
              <p className="text-[11px] text-muted-foreground mt-1">Conducted lecture sessions</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Verified Presences
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {totalVerifiedPresents}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground mt-1">Total student face hits</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Average Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{overallRate}%</div>}
              <p className="text-[11px] text-muted-foreground mt-1">Present ratio across roster</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Export Readiness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">CSV Ready</div>
              <p className="text-[11px] text-muted-foreground mt-1">Standardized tabular schema</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Records Table */}
        <Card className="border-border/80 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Attendance Log Entries</CardTitle>
              <CardDescription className="text-xs">
                Audited student facial recognition timestamps and confidence metrics
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground space-y-2">
                <FileSpreadsheet className="h-8 w-8 mx-auto opacity-50" />
                <p className="font-semibold text-sm text-foreground">No records matched the filter criteria</p>
                <p>Ensure sessions have been run with faces verified.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] uppercase tracking-wider text-muted-foreground border-b bg-muted/40">
                    <tr>
                      <th className="py-3 px-4">Roll</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredRecords.map((r) => {
                      const parentSession = sessions.find((s) => s.id === r.session_id);
                      return (
                        <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium">{r.student?.roll_number || "—"}</td>
                          <td className="py-3 px-4 font-semibold text-foreground">
                            {r.student?.full_name || "Enrolled Student"}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {parentSession?.subject?.name || "Lecture"}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{formatDate(r.marked_at)}</td>
                          <td className="py-3 px-4">
                            <Badge variant="success" className="text-[10px]">
                              {r.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-medium">
                            {Math.round(r.confidence * 100)}%
                          </td>
                        </tr>
                      );
                    })}
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
