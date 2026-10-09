"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  Percent,
  BookOpen,
  Camera,
  UserPlus,
  PlusCircle,
  BarChart3,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dbService } from "@/services/db";
import { formatDate, formatTime } from "@/lib/utils";
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

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Title & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">System Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Live biometric attendance overview and academic session records
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/attendance/new">
              <Button className="shadow-sm">
                <Camera className="h-4 w-4 mr-2" />
                Take Attendance
              </Button>
            </Link>
            <Link href="/students/new">
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Enrolled
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalStudents ?? 0}</div>
              )}
              <p className="text-[11px] text-muted-foreground mt-1">Students in active classes</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Today Present
              </CardTitle>
              <UserCheck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats?.todayPresentCount ?? 0}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground mt-1">Verified via facial recognition</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Today Absent
              </CardTitle>
              <UserX className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {stats?.todayAbsentCount ?? 0}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground mt-1">Pending verification</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Attendance Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.attendancePercentage ?? 0}%
                </div>
              )}
              <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.attendancePercentage ?? 0}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Shortcuts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/attendance/new" className="block">
            <div className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-sm transition-all text-center space-y-1">
              <Camera className="h-5 w-5 mx-auto text-primary" />
              <div className="text-xs font-semibold">Start Session</div>
              <div className="text-[10px] text-muted-foreground">Open webcam room</div>
            </div>
          </Link>
          <Link href="/students/new" className="block">
            <div className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-sm transition-all text-center space-y-1">
              <UserPlus className="h-5 w-5 mx-auto text-emerald-500" />
              <div className="text-xs font-semibold">Enroll Student</div>
              <div className="text-[10px] text-muted-foreground">3-pose face capture</div>
            </div>
          </Link>
          <Link href="/subjects" className="block">
            <div className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-sm transition-all text-center space-y-1">
              <PlusCircle className="h-5 w-5 mx-auto text-blue-500" />
              <div className="text-xs font-semibold">Subjects & Classes</div>
              <div className="text-[10px] text-muted-foreground">Manage courses</div>
            </div>
          </Link>
          <Link href="/reports" className="block">
            <div className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-sm transition-all text-center space-y-1">
              <BarChart3 className="h-5 w-5 mx-auto text-amber-500" />
              <div className="text-xs font-semibold">Export CSV</div>
              <div className="text-[10px] text-muted-foreground">Full analytics logs</div>
            </div>
          </Link>
        </div>

        {/* Recent Sessions Table & Activity */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recent Attendance Sessions</CardTitle>
              <CardDescription className="text-xs">
                History of recently launched camera recognition sessions
              </CardDescription>
            </div>
            <Link href="/attendance">
              <Button variant="ghost" size="sm" className="text-xs">
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !stats?.recentSessions || stats.recentSessions.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground/60" />
                <p className="text-sm font-medium">No attendance sessions recorded yet</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Launch a new live attendance session to test face recognition and view automatic presence logs.
                </p>
                <Link href="/attendance/new">
                  <Button size="sm" className="mt-2">
                    Start First Session
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] uppercase tracking-wider text-muted-foreground border-b bg-muted/40">
                    <tr>
                      <th className="py-2.5 px-3">Subject / Course</th>
                      <th className="py-2.5 px-3">Class & Semester</th>
                      <th className="py-2.5 px-3">Started At</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {stats.recentSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3 font-medium">
                          {session.subject?.name || "Lecture Session"}
                          <span className="text-muted-foreground ml-1 font-mono text-[10px]">
                            ({session.subject?.code || "—"})
                          </span>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">
                          {session.class_name} • {session.semester}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">
                          {formatDate(session.started_at)}
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant={
                              session.status === "active"
                                ? "success"
                                : session.status === "completed"
                                ? "outline"
                                : "destructive"
                            }
                            className="text-[10px]"
                          >
                            {session.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link href={`/attendance/${session.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              {session.status === "active" ? "Resume" : "View"}
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
