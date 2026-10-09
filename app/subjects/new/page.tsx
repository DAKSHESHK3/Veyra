"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dbService } from "@/services/db";

export default function NewSubjectPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [className, setClassName] = useState("CS-5th");
  const [semester, setSemester] = useState("5th Semester");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const created = await dbService.createSubject({
        name: name.trim(),
        code: code.toUpperCase().trim(),
        class_name: className.trim(),
        semester: semester.trim(),
        is_active: true,
      });

      router.push(`/subjects/${created.id}`);
    } catch (err: any) {
      setError(err?.message || "Failed to provision subject.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-[#222220] pb-4">
          <Link
            href="/subjects"
            className="text-[#9A9A94] hover:text-[#E3C283] font-mono text-xs flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> CANCEL & RETURN
          </Link>
          <span className="font-mono text-[10px] uppercase text-[#E3C283] tracking-widest">
            NODE // COURSE_PROVISIONING
          </span>
        </div>

        <div className="border border-[#222220] bg-[#0E0E0E] p-8">
          <div className="mb-6 border-b border-[#222220] pb-4">
            <span className="font-mono text-[10px] uppercase text-[#E3C283] tracking-[0.2em] block mb-1">
              [ ACADEMIC CATALOG ]
            </span>
            <h1 className="text-xl font-light text-[#F3F0E8] uppercase">
              Provision New Academic Subject
            </h1>
            <p className="text-xs text-[#9A9A94] font-mono mt-1">
              Registers course unit with biometric verification routing across faculties.
            </p>
          </div>

          {error && (
            <div className="p-3 font-mono text-xs mb-6 flex items-center gap-2 border bg-[#201F1F] border-red-500/50 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9A9A94] mb-2">
                SUBJECT / COURSE NAME
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Distributed Operating Systems"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#131313] border-[#222220] text-[#F3F0E8] focus:border-[#E3C283] font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9A9A94] mb-2">
                  COURSE IDENTIFIER / CODE
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. CS504"
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
                href="/subjects"
                className="px-4 py-2 border border-[#222220] text-[#9A9A94] hover:text-[#F3F0E8] font-mono text-xs uppercase"
              >
                CANCEL
              </Link>
              <Button
                type="submit"
                variant="champagne"
                disabled={isSubmitting}
                className="font-mono text-xs uppercase"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                {isSubmitting ? "PROVISIONING..." : "PROVISION COURSE"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
