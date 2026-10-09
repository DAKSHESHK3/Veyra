"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
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
    if (confirm(`Prune biometric profile and records for ${student.full_name}?`)) {
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
          <Skeleton className="h-8 w-40 bg-[#1C1B1B]" />
          <Skeleton className="h-64 w-full bg-[#1C1B1B]" />
        </div>
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout>
        <div className="text-center py-12 space-y-3 font-mono text-xs text-[#929189]">
          <p>STUDENT PROFILE NOT FOUND IN REPOSITORY</p>
          <Link href="/students">
            <Button variant="outline" size="sm">
              &larr; RETURN TO DIRECTORY
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto select-none">
        <div className="flex items-center justify-between border-b border-[#222220] pb-4">
          <Link
            href="/students"
            className="inline-flex items-center font-mono text-[10px] text-[#929189] hover:text-[#E3C283] transition-colors uppercase"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            [ ROSTER DIRECTORY ]
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="h-8 text-[10px]"
          >
            <Trash2 className="h-3 w-3 mr-1.5" />
            PRUNE BIOMETRIC PROFILE
          </Button>
        </div>

        {/* Profile Card */}
        <div className="border border-[#222220] bg-[#0E0E0E]">
          <div className="p-6 border-b border-[#222220] flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[10px] text-[#E3C283] tracking-[0.25em] uppercase">
                [ BIOMETRIC RECORD // {student.roll_number} ]
              </span>
              <h1 className="font-sans text-2xl text-[#ffffff] font-normal uppercase">
                {student.full_name}
              </h1>
            </div>
            <span className="px-2.5 py-1 bg-[#5C4612]/30 border border-[#E3C283]/40 text-[#E3C283] font-mono text-[10px]">
              VERIFIED
            </span>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-3 border border-[#222220] bg-[#131313]">
                <span className="text-[10px] text-[#929189] block uppercase">ROLL NUMBER</span>
                <span className="text-[#E3C283] font-bold text-sm">{student.roll_number}</span>
              </div>
              <div className="p-3 border border-[#222220] bg-[#131313]">
                <span className="text-[10px] text-[#929189] block uppercase">SECTION</span>
                <span className="text-[#ffffff] text-sm">{student.class_name}</span>
              </div>
              <div className="p-3 border border-[#222220] bg-[#131313]">
                <span className="text-[10px] text-[#929189] block uppercase">SEMESTER</span>
                <span className="text-[#C9C7BD] text-sm">{student.semester}</span>
              </div>
              <div className="p-3 border border-[#222220] bg-[#131313]">
                <span className="text-[10px] text-[#929189] block uppercase">ENROLLED AT</span>
                <span className="text-[#C9C7BD] text-xs">
                  {student.created_at ? formatDate(student.created_at) : "—"}
                </span>
              </div>
            </div>

            {/* Biometric Math Status */}
            <div className="p-4 border border-[#222220] bg-[#090909] font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-[#929189] border-b border-[#222220] pb-2">
                <span className="text-[#ffffff] font-bold">128-D CENTROID VECTOR STATUS</span>
                <span className="text-[#E3C283]">CALIBRATED (30 POSES)</span>
              </div>
              <p className="text-[#929189] text-[10px] leading-relaxed">
                Biometric feature embeddings are stored as 128 normalized float components. Raw webcam images are discarded in browser memory following centroid generation and are never transmitted to server infrastructure.
              </p>
            </div>

            {/* Quick Actions: Edit Profile & Biometric Re-Enroll */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/students/${student.id}/edit`}
                className="border border-[#474740] bg-[#131313] hover:border-[#E3C283] text-[#F3F0E8] px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors"
              >
                EDIT STUDENT RECORD
              </Link>
              <Link
                href={`/students/${student.id}/enroll`}
                className="border border-[#E3C283]/40 bg-[#5C4612]/20 hover:border-[#E3C283] text-[#E3C283] px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors"
              >
                RE-CALIBRATE BIOMETRICS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
