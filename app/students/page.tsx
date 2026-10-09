"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserPlus, Search, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { dbService } from "@/services/db";
import { Student } from "@/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  const fetchStudents = async () => {
    try {
      const data = await dbService.getStudents();
      setStudents(data);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Remove biometric profile for ${name}? Mathematical vectors will be pruned.`)) {
      try {
        await dbService.deleteStudent(id);
        await fetchStudents();
      } catch (err: any) {
        alert(err?.message || "Failed to delete student.");
      }
    }
  };

  const classes = Array.from(new Set(students.map((s) => s.class_name)));

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(search.toLowerCase()) ||
      s.class_name.toLowerCase().includes(search.toLowerCase());
    const matchesClass = selectedClass === "all" || s.class_name === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <AppLayout>
      <div className="space-y-6 select-none max-w-7xl mx-auto">
        {/* Header Horizon */}
        <div className="border-b border-[#222220] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-[#E3C283] tracking-[0.25em] uppercase">
              [ DIRECTORY // 002 ]
            </span>
            <h1 className="font-sans text-2xl md:text-3xl font-light text-[#ffffff] uppercase tracking-tight">
              ENROLLED STUDENTS
            </h1>
            <p className="font-mono text-xs text-[#929189]">
              Cryptographic biometric registry with 128-dimensional centroid fingerprints
            </p>
          </div>

          <Link href="/students/new">
            <Button variant="champagne" size="sm" className="h-9 px-4 font-bold">
              <UserPlus className="h-3.5 w-3.5 mr-2" />
              ENROLL STUDENT →
            </Button>
          </Link>
        </div>

        {/* Search & Filter Strip */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#929189]" />
            <Input
              placeholder="SEARCH BY NAME, ROLL NUMBER..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-[11px]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto font-mono text-xs">
            <span className="text-[#929189] text-[10px] uppercase">BATCH:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-10 px-3 bg-[#0E0E0E] border border-[#222220] text-xs font-mono text-[#F3F0E8] focus:border-[#E3C283] focus:outline-none"
            >
              <option value="all">ALL DEPARTMENTS ({students.length})</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Editorial Rows Table */}
        <div className="border border-[#222220] bg-[#0E0E0E]">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-[#222220] bg-[#131313] text-[#929189] text-[9px] uppercase tracking-[0.18em]">
                  <th className="py-3 px-4 font-normal">ROLL</th>
                  <th className="py-3 px-4 font-normal">STUDENT NAME</th>
                  <th className="py-3 px-4 font-normal">DEPARTMENT / TIER</th>
                  <th className="py-3 px-4 font-normal">BIOMETRIC STATUS</th>
                  <th className="py-3 px-4 font-normal">CENTROID</th>
                  <th className="py-3 px-4 font-normal text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222220]/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-6">
                      <div className="space-y-3">
                        <Skeleton className="h-8 w-full bg-[#1C1B1B]" />
                        <Skeleton className="h-8 w-full bg-[#1C1B1B]" />
                        <Skeleton className="h-8 w-full bg-[#1C1B1B]" />
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-[#929189] font-mono text-xs">
                      NO STUDENT PROFILES MATCHING FILTER
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-[#131313] hover:border-l-2 hover:border-l-[#E3C283] transition-all group"
                    >
                      <td className="py-3.5 px-4 text-[#E3C283] font-bold font-mono">
                        {s.roll_number}
                      </td>
                      <td className="py-3.5 px-4 text-[#ffffff] font-medium uppercase">
                        {s.full_name}
                      </td>
                      <td className="py-3.5 px-4 text-[#C9C7BD]">
                        {s.class_name} • {s.semester}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-[#5C4612]/30 border border-[#E3C283]/40 text-[#E3C283] font-mono text-[9px]">
                          VERIFIED
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#929189] text-[10px]">
                        128-D L2 NORMALIZED
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id, s.full_name)}
                          className="text-[#929189] hover:text-[#FFB4AB] transition-colors uppercase text-[10px]"
                        >
                          [ PRUNE ]
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
