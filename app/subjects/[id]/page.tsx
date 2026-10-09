"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Users,
  Play,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { dbService } from "@/services/db";
import { Subject, Student, AttendanceSession } from "@/types";
import { formatDate } from "@/lib/utils";

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params?.id as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sub, allStuds, allSess] = await Promise.all([
          dbService.getSubjectById(subjectId),
          dbService.getStudents(),
          dbService.getAttendanceSessions(),
        ]);
        setSubject(sub);
        if (sub) {
          setStudents(allStuds.filter((s) => s.class_name === sub.class_name));
          setSessions(allSess.filter((s) => s.subject_id === sub.id));
        }
      } catch (err) {
        console.error("Failed loading subject details:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [subjectId]);

  const handleDelete = async () => {
    if (!subject) return;
    if (confirm(`Deprovision course "${subject.name}" (${subject.code})?`)) {
      try {
        await dbService.deleteSubject(subject.id);
        router.push("/subjects");
      } catch (err: any) {
        alert(err?.message || "Failed to delete subject.");
      }
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="py-24 text-center font-mono text-xs text-[#9A9A94] uppercase tracking-widest">
          QUERYING COURSE CATALOG // {subjectId}...
        </div>
      </AppLayout>
    );
  }

  if (!subject) {
    return (
      <AppLayout>
        <div className="py-24 text-center">
          <p className="font-mono text-sm text-[#C9C7BD] mb-4">
            SUBJECT RECORD NOT FOUND
          </p>
          <Link href="/subjects" className="font-mono text-xs text-[#E3C283] hover:underline">
            &larr; RETURN TO CATALOG
          </Link>
        </div>
      </AppLayout>
    );
  }

  const activeSessions = sessions.filter((s) => s.status === "active");

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[#222220] pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/subjects"
              className="text-[#9A9A94] hover:text-[#E3C283] font-mono text-xs flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> COURSES
            </Link>
            <span className="text-[#474740] font-mono text-xs">/</span>
            <span className="font-mono text-xs text-[#F3F0E8] uppercase tracking-wider">
              {subject.code} {"//"} DETAIL
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/subjects/${subject.id}/edit`}>
              <Button variant="outline" size="sm" className="font-mono text-xs uppercase">
                <Edit className="w-3.5 h-3.5 mr-1.5" /> EDIT COURSE
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="font-mono text-xs uppercase"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> DEPROVISION
            </Button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="border border-[#222220] bg-[#0E0E0E] p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#222220] pb-6 mb-6">
            <div>
              <div className="font-mono text-[10px] text-[#E3C283] uppercase tracking-widest mb-1">
                [{subject.code}] // {subject.class_name} • {subject.semester}
              </div>
              <h1 className="text-2xl font-light text-[#F3F0E8] tracking-tight">
                {subject.name}
              </h1>
              <p className="text-xs text-[#9A9A94] mt-1 font-mono">
                Assigned faculty lead node with biometric identity verification protocol.
              </p>
            </div>

            <Link href="/attendance/new">
              <Button variant="champagne" size="sm" className="font-mono text-xs uppercase">
                <Play className="w-3.5 h-3.5 mr-1.5" /> INITIALIZE ATTENDANCE SESSION
              </Button>
            </Link>
          </div>

          {/* Metric Quad */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-[#222220] bg-[#131313] p-4">
              <div className="font-mono text-[10px] uppercase text-[#9A9A94] mb-1">
                ENROLLED ROSTER
              </div>
              <div className="font-mono text-2xl text-[#F3F0E8]">{students.length}</div>
            </div>
            <div className="border border-[#222220] bg-[#131313] p-4">
              <div className="font-mono text-[10px] uppercase text-[#9A9A94] mb-1">
                TOTAL SESSIONS
              </div>
              <div className="font-mono text-2xl text-[#E3C283]">{sessions.length}</div>
            </div>
            <div className="border border-[#222220] bg-[#131313] p-4">
              <div className="font-mono text-[10px] uppercase text-[#9A9A94] mb-1">
                ACTIVE ROOMS
              </div>
              <div className="font-mono text-2xl text-[#F3F0E8]">{activeSessions.length}</div>
            </div>
            <div className="border border-[#222220] bg-[#131313] p-4">
              <div className="font-mono text-[10px] uppercase text-[#9A9A94] mb-1">
                FACULTY PODIUM
              </div>
              <div className="font-mono text-xs text-[#C9C7BD] mt-2">ASSIGNED</div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Cohort Students Left, Past Sessions Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Enrolled Students */}
          <div className="lg:col-span-7 border border-[#222220] bg-[#0E0E0E]">
            <div className="p-4 border-b border-[#222220] flex items-center justify-between">
              <div className="font-mono text-xs uppercase tracking-wider text-[#F3F0E8]">
                REGISTERED COHORT ({students.length} STUDENTS)
              </div>
              <div className="font-mono text-[10px] text-[#9A9A94]">
                SECTION: {subject.class_name}
              </div>
            </div>

            <div className="divide-y divide-[#222220]">
              {students.length === 0 ? (
                <div className="p-8 text-center font-mono text-xs text-[#9A9A94]">
                  NO STUDENTS ENROLLED IN THIS CLASS SECTION
                </div>
              ) : (
                students.map((st) => (
                  <div
                    key={st.id}
                    className="p-3.5 flex items-center justify-between hover:bg-[#131313]/50 transition-colors font-mono text-xs"
                  >
                    <div>
                      <Link
                        href={`/students/${st.id}`}
                        className="font-sans text-sm text-[#F3F0E8] hover:text-[#E3C283] transition-colors"
                      >
                        {st.full_name}
                      </Link>
                      <div className="text-[10px] text-[#9A9A94]">ROLL: {st.roll_number}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 border border-[#E3C283]/30 text-[#E3C283] bg-[#5C4612]/20">
                      CALIBRATED
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Past Sessions */}
          <div className="lg:col-span-5 border border-[#222220] bg-[#0E0E0E]">
            <div className="p-4 border-b border-[#222220] flex items-center justify-between">
              <div className="font-mono text-xs uppercase tracking-wider text-[#F3F0E8]">
                ATTENDANCE SESSIONS ({sessions.length})
              </div>
            </div>

            <div className="divide-y divide-[#222220]">
              {sessions.length === 0 ? (
                <div className="p-8 text-center font-mono text-xs text-[#9A9A94]">
                  NO ATTENDANCE SESSIONS CONDUCTED YET
                </div>
              ) : (
                sessions.map((sess) => (
                  <Link
                    key={sess.id}
                    href={`/attendance/${sess.id}/results`}
                    className="p-3.5 flex items-center justify-between hover:bg-[#131313] transition-colors font-mono text-xs block group"
                  >
                    <div>
                      <div className="text-[#F3F0E8] group-hover:text-[#E3C283] transition-colors">
                        ROOM: {sess.room || "MAIN HALL"}
                      </div>
                      <div className="text-[10px] text-[#9A9A94]">
                        {formatDate(sess.started_at)}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] uppercase px-2 py-0.5 border ${
                        sess.status === "active"
                          ? "border-[#E3C283] text-[#E3C283] bg-[#5C4612]/20"
                          : "border-[#474740] text-[#9A9A94]"
                      }`}
                    >
                      {sess.status}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
