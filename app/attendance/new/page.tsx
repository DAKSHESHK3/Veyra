"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, Play } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dbService } from "@/services/db";
import { Subject } from "@/types";

export default function NewAttendanceSessionPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [className, setClassName] = useState("CS-5th");
  const [semester, setSemester] = useState("5th Semester");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const list = await dbService.getSubjects();
        setSubjects(list);
        if (list.length > 0) {
          setSelectedSubjectId(list[0].id);
          setClassName(list[0].class_name);
          setSemester(list[0].semester);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubjectChange = (id: string) => {
    setSelectedSubjectId(id);
    const sub = subjects.find((s) => s.id === id);
    if (sub) {
      setClassName(sub.class_name);
      setSemester(sub.semester);
    }
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      setError("Please select a subject to initiate attendance.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const session = await dbService.createAttendanceSession({
        subject_id: selectedSubjectId,
        class_name: className,
        semester,
      });

      router.push(`/attendance/${session.id}`);
    } catch (err: any) {
      setError(err?.message || "Failed to start attendance session.");
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto space-y-6 select-none">
        <Link
          href="/attendance"
          className="inline-flex items-center font-mono text-[10px] text-[#929189] hover:text-[#E3C283] transition-colors uppercase"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          [ RETURN TO ACTIVE SESSIONS ]
        </Link>

        <div className="border border-[#222220] bg-[#0E0E0E]">
          <div className="p-6 border-b border-[#222220] space-y-1">
            <span className="font-mono text-[10px] text-[#E3C283] tracking-[0.25em] uppercase">
              [ PROTOCOL // SESSION INITIALIZATION ]
            </span>
            <h2 className="font-sans text-xl text-[#ffffff] uppercase tracking-tight">
              LAUNCH ATTENDANCE ROOM
            </h2>
            <p className="font-mono text-xs text-[#929189]">
              Configure lecture parameters to engage client-side biometric verification
            </p>
          </div>

          <form onSubmit={handleStartSession} className="p-6 space-y-5">
            {error && (
              <div className="p-3 border border-[#FFB4AB]/40 bg-[#93000A]/30 text-[#FFB4AB] font-mono text-xs">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] uppercase text-[#929189] tracking-wider">
                SUBJECT / COURSE CODE
              </label>
              {loading ? (
                <div className="h-10 bg-[#1C1B1B] border border-[#222220] animate-pulse" />
              ) : subjects.length === 0 ? (
                <div className="p-3 border border-[#222220] bg-[#131313] font-mono text-xs text-[#929189]">
                  No courses registered. Please add a course in Subjects first.
                </div>
              ) : (
                <select
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full h-10 px-3 bg-[#0E0E0E] border border-[#222220] text-xs font-mono text-[#F3F0E8] focus:border-[#E3C283] focus:outline-none"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} [{sub.code}] — {sub.class_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] uppercase text-[#929189] tracking-wider">
                  CLASS BATCH
                </label>
                <Input
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="CS-5th"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] uppercase text-[#929189] tracking-wider">
                  SEMESTER / TIER
                </label>
                <Input
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="5th Semester"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-[#131313] border border-[#222220] font-mono text-[10px] text-[#929189] space-y-1">
              <div className="flex items-center gap-1.5 text-[#E3C283]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E3C283]" />
                VERIFICATION ENGINE: LOCAL WEBGL 2.0
              </div>
              <div>
                Raw camera telemetry is strictly computed in client memory. No video streams are
                persisted.
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="champagne"
                className="w-full h-11 font-bold"
                isLoading={isSubmitting}
                disabled={loading || subjects.length === 0}
              >
                <Play className="h-3.5 w-3.5 mr-2" />
                INITIALIZE WEBCAM SESSION →
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
