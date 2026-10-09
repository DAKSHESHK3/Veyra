"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, BookOpen } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { dbService } from "@/services/db";
import { Subject } from "@/types";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [className, setClassName] = useState("CS-5th");
  const [semester, setSemester] = useState("5th Semester");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      const data = await dbService.getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error("Failed to load subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      await dbService.createSubject({
        name,
        code: code.toUpperCase().trim(),
        class_name: className,
        semester,
        is_active: true,
      });

      setName("");
      setCode("");
      setIsModalOpen(false);
      await fetchSubjects();
    } catch (err: any) {
      setFormError(err?.message || "Failed to create subject.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.class_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6 select-none max-w-7xl mx-auto">
        {/* Header Horizon */}
        <div className="border-b border-[#222220] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-[#E3C283] tracking-[0.25em] uppercase">
              [ ACADEMIC CATALOG // 003 ]
            </span>
            <h1 className="font-sans text-2xl md:text-3xl font-light text-[#ffffff] uppercase tracking-tight">
              SUBJECTS &amp; CURRICULUM
            </h1>
            <p className="font-mono text-xs text-[#929189]">
              Department courses, lecture assignments, and faculty session endpoints
            </p>
          </div>

          <Button
            variant="champagne"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-9 px-4 font-bold"
          >
            <Plus className="h-3.5 w-3.5 mr-2" />
            ADD COURSE →
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#929189]" />
            <Input
              placeholder="SEARCH BY COURSE NAME, CODE, OR SECTION..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-[11px]"
            />
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 border border-[#222220] bg-[#0E0E0E] space-y-3">
                <Skeleton className="h-6 w-32 bg-[#1C1B1B]" />
                <Skeleton className="h-4 w-48 bg-[#1C1B1B]" />
              </div>
            ))
          ) : filteredSubjects.length === 0 ? (
            <div className="col-span-full p-12 border border-[#222220] bg-[#0E0E0E] text-center font-mono text-xs text-[#929189]">
              NO ACADEMIC COURSES REGISTERED
            </div>
          ) : (
            filteredSubjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/subjects/${sub.id}`}
                className="p-6 border border-[#222220] bg-[#0E0E0E] hover:border-[#E3C283] hover:bg-[#131313] transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#E3C283] uppercase tracking-wider">
                      [{sub.code}]
                    </span>
                    <span className="px-2 py-0.5 border border-[#474740]/40 text-[#929189] font-mono text-[9px] uppercase">
                      ACTIVE
                    </span>
                  </div>
                  <h3 className="font-sans text-lg text-[#ffffff] font-normal leading-snug group-hover:text-[#E3C283] transition-colors">
                    {sub.name}
                  </h3>
                  <p className="font-mono text-xs text-[#C9C7BD]">
                    {sub.class_name} • {sub.semester}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#222220] flex items-center justify-between font-mono text-[10px] text-[#929189]">
                  <span>COURSE OVERVIEW &rarr;</span>
                  <span className="text-[#E3C283]">READY FOR SCAN</span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Modal: Add Subject */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#0E0E0E]/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#131313] border border-[#222220] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#222220] pb-3">
                <span className="font-mono text-[10px] text-[#E3C283] uppercase tracking-wider">
                  [ PROVISION NEW COURSE ]
                </span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="font-mono text-xs text-[#929189] hover:text-[#ffffff]"
                >
                  × CLOSE
                </button>
              </div>

              <form onSubmit={handleCreateSubject} className="space-y-4">
                {formError && (
                  <div className="p-3 border border-[#FFB4AB]/40 bg-[#93000A]/30 text-[#FFB4AB] font-mono text-xs">
                    {formError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block font-mono text-[10px] text-[#929189] uppercase">
                    COURSE TITLE *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Distributed Database Systems"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-[10px] text-[#929189] uppercase">
                    SUBJECT CODE *
                  </label>
                  <Input
                    required
                    placeholder="e.g. CS-502"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-mono text-[10px] text-[#929189] uppercase">
                      CLASS / SECTION
                    </label>
                    <Input
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="CS-5th"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-mono text-[10px] text-[#929189] uppercase">
                      SEMESTER
                    </label>
                    <Input
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      placeholder="5th Semester"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#222220]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    className="border-[#474740]"
                  >
                    CANCEL
                  </Button>
                  <Button
                    type="submit"
                    variant="champagne"
                    size="sm"
                    isLoading={isSubmitting}
                    className="font-bold px-6"
                  >
                    REGISTER COURSE
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
