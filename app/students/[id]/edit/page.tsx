"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dbService } from "@/services/db";
import { Student } from "@/types";

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [className, setClassName] = useState("");
  const [semester, setSemester] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await dbService.getStudentById(studentId);
        if (data) {
          setStudent(data);
          setFullName(data.full_name);
          setRollNumber(data.roll_number);
          setClassName(data.class_name);
          setSemester(data.semester);
          setEmail(data.email || "");
        }
      } catch (err) {
        console.error("Failed to load student for edit:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setSaving(true);
    setStatusMsg(null);

    try {
      await dbService.updateStudent(student.id, {
        full_name: fullName.trim(),
        roll_number: rollNumber.trim(),
        class_name: className.trim(),
        semester: semester.trim(),
        email: email.trim() || undefined,
      });
      setStatusMsg({ type: "success", text: "Student identity record updated successfully." });
      setTimeout(() => {
        router.push(`/students/${student.id}`);
      }, 1000);
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err?.message || "Failed to persist modifications." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="py-24 text-center font-mono text-xs text-[#9A9A94] uppercase tracking-widest">
          FETCHING STUDENT RECORD // {studentId}...
        </div>
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout>
        <div className="py-24 text-center">
          <p className="font-mono text-sm text-[#C9C7BD] mb-4">
            STUDENT RECORD NOT FOUND
          </p>
          <Link href="/students" className="font-mono text-xs text-[#E3C283] hover:underline">
            &larr; RETURN TO ROSTER
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-[#222220] pb-4">
          <Link
            href={`/students/${student.id}`}
            className="text-[#9A9A94] hover:text-[#E3C283] font-mono text-xs flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> CANCEL & RETURN
          </Link>
          <span className="font-mono text-[10px] uppercase text-[#E3C283] tracking-widest">
            NODE // RECORD_MUTATION
          </span>
        </div>

        <div className="border border-[#222220] bg-[#0E0E0E] p-8">
          <div className="mb-6 border-b border-[#222220] pb-4">
            <span className="font-mono text-[10px] uppercase text-[#E3C283] tracking-[0.2em] block mb-1">
              [ IDENTITY CONFIGURATION ]
            </span>
            <h1 className="text-xl font-light text-[#F3F0E8] uppercase">
              Modify Student Metadata // {student.roll_number}
            </h1>
          </div>

          {statusMsg && (
            <div
              className={`p-3 font-mono text-xs mb-6 flex items-center gap-2 border ${
                statusMsg.type === "success"
                  ? "bg-[#5C4612]/20 border-[#E3C283] text-[#E3C283]"
                  : "bg-[#201F1F] border-red-500/50 text-red-400"
              }`}
            >
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9A9A94] mb-2">
                FULL LEGAL NAME
              </label>
              <Input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-[#131313] border-[#222220] text-[#F3F0E8] focus:border-[#E3C283] font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9A9A94] mb-2">
                  ROLL NUMBER / IDENTIFIER
                </label>
                <Input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="bg-[#131313] border-[#222220] text-[#F3F0E8] focus:border-[#E3C283] font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9A9A94] mb-2">
                  CLASS / SECTION
                </label>
                <Input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="bg-[#131313] border-[#222220] text-[#F3F0E8] focus:border-[#E3C283] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9A9A94] mb-2">
                  ACADEMIC SEMESTER
                </label>
                <Input
                  type="text"
                  required
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="bg-[#131313] border-[#222220] text-[#F3F0E8] focus:border-[#E3C283] font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9A9A94] mb-2">
                  EMAIL ADDRESS (OPTIONAL)
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#131313] border-[#222220] text-[#F3F0E8] focus:border-[#E3C283] font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#222220] flex items-center justify-end gap-3">
              <Link
                href={`/students/${student.id}`}
                className="px-4 py-2 border border-[#222220] text-[#9A9A94] hover:text-[#F3F0E8] font-mono text-xs uppercase"
              >
                CANCEL
              </Link>
              <Button
                type="submit"
                variant="champagne"
                disabled={saving}
                className="font-mono text-xs uppercase"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {saving ? "SAVING RECORD..." : "COMMIT MODIFICATIONS"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
