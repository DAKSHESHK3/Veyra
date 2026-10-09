"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dbService } from "@/services/db";
import { Subject } from "@/types";

export default function EditSubjectPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params?.id as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [className, setClassName] = useState("");
  const [semester, setSemester] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await dbService.getSubjectById(subjectId);
        if (data) {
          setSubject(data);
          setName(data.name);
          setCode(data.code);
          setClassName(data.class_name);
          setSemester(data.semester);
        }
      } catch (err) {
        console.error("Failed to load subject for edit:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [subjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) return;
    setSaving(true);
    setStatusMsg(null);

    try {
      await dbService.updateSubject(subject.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        class_name: className.trim(),
        semester: semester.trim(),
      });
      setStatusMsg({ type: "success", text: "Subject definition updated successfully." });
      setTimeout(() => {
        router.push(`/subjects/${subject.id}`);
      }, 1000);
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err?.message || "Failed to persist course modifications." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="py-24 text-center font-mono text-xs text-[#9A9A94] uppercase tracking-widest">
          FETCHING COURSE METADATA // {subjectId}...
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

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-[#222220] pb-4">
          <Link
            href={`/subjects/${subject.id}`}
            className="text-[#9A9A94] hover:text-[#E3C283] font-mono text-xs flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> CANCEL & RETURN
          </Link>
          <span className="font-mono text-[10px] uppercase text-[#E3C283] tracking-widest">
            NODE // COURSE_MUTATION
          </span>
        </div>

        <div className="border border-[#222220] bg-[#0E0E0E] p-8">
          <div className="mb-6 border-b border-[#222220] pb-4">
            <span className="font-mono text-[10px] uppercase text-[#E3C283] tracking-[0.2em] block mb-1">
              [ COURSE SPECIFICATION ]
            </span>
            <h1 className="text-xl font-light text-[#F3F0E8] uppercase">
              Modify Subject // {subject.code}
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
                SUBJECT NAME
              </label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#131313] border-[#222220] text-[#F3F0E8] focus:border-[#E3C283] font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9A9A94] mb-2">
                  COURSE CODE
                </label>
                <Input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-[#131313] border-[#222220] text-[#F3F0E8] focus:border-[#E3C283] font-mono uppercase"
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

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9A9A94] mb-2">
                SEMESTER
              </label>
              <Input
                type="text"
                required
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="bg-[#131313] border-[#222220] text-[#F3F0E8] focus:border-[#E3C283] font-mono"
              />
            </div>

            <div className="pt-4 border-t border-[#222220] flex items-center justify-end gap-3">
              <Link
                href={`/subjects/${subject.id}`}
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
                {saving ? "SAVING..." : "COMMIT CHANGES"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
