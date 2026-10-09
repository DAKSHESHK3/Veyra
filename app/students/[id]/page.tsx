"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Trash2,
  Camera,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dbService } from "@/services/db";
import { Student } from "@/types";
import { formatDate } from "@/lib/utils";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await dbService.getStudentById(id);
        setStudent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!student) return;
    if (confirm(`Permanently delete ${student.full_name}?`)) {
      try {
        await dbService.deleteStudent(student.id);
        router.push("/students");
      } catch (err: any) {
        alert(err?.message || "Failed to delete student.");
      }
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout>
        <div className="text-center py-12 space-y-3">
          <p className="text-base font-semibold">Student record not found</p>
          <Link href="/students">
            <Button variant="outline" size="sm">
              &larr; Back to Student Directory
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <Link href="/students" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Students
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="text-xs"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete Student
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-blue-400 text-primary-foreground flex items-center justify-center font-bold text-xl shadow-md">
                  {student.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">{student.full_name}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Roll Number: <span className="font-mono font-bold text-foreground">{student.roll_number}</span> • {student.class_name} ({student.semester})
                  </CardDescription>
                </div>
              </div>
              <Badge variant="success" className="gap-1 text-xs">
                <ShieldCheck className="h-3.5 w-3.5" />
                Active Profile
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/40 border text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Email Address</span>
                <span className="font-medium">{student.email || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Enrolled Date</span>
                <span className="font-medium">{formatDate(student.created_at)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Biometric Model</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">FaceNet 128-d Metric</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Biometric Enrollment Status</h4>
              <div className="p-4 rounded-xl border border-border/80 bg-card space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Facial Embedding Registered
                  </span>
                  <Badge variant="outline" className="text-[10px]">30 Samples Centroid</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Student feature vector is active in the in-memory matching pool. The browser can identify this student during live lecture sessions with temporal verification.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
