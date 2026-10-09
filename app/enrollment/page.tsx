"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Fingerprint,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Camera,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dbService } from "@/services/db";
import { Student } from "@/types";
import { formatDate } from "@/lib/utils";

export default function EnrollmentDirectoryPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("ALL");

  useEffect(() => {
    async function load() {
      try {
        const data = await dbService.getStudents();
        setStudents(data);
      } catch (err) {
        console.error("Error loading enrollment queue:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const classes = ["ALL", ...Array.from(new Set(students.map((s) => s.class_name)))];

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(search.toLowerCase());
    const matchesClass = filterClass === "ALL" || s.class_name === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222220] pb-6">
          <div>
            <div className="font-mono text-[10px] text-[#E3C283] uppercase tracking-[0.25em] mb-1 flex items-center gap-2">
              <Fingerprint className="w-3.5 h-3.5" />
              BIOMETRIC IDENTITY REGISTRATION PIPELINE
            </div>
            <h1 className="text-2xl font-light text-[#F3F0E8] tracking-tight">
              Biometric Calibration Registry
            </h1>
            <p className="text-xs text-[#9A9A94] mt-1 font-mono">
              Manage multi-pose facial centroid vectors across student cohorts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/students/new">
              <Button variant="champagne" size="sm" className="font-mono text-xs uppercase">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> ENROLL NEW SUBJECT
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#222220] bg-[#0E0E0E] p-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A94]" />
            <Input
              type="text"
              placeholder="SEARCH BY NAME OR ROLL //"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#131313] border-[#222220] text-xs font-mono text-[#F3F0E8] focus:border-[#E3C283]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {classes.map((cls) => (
              <button
                key={cls}
                onClick={() => setFilterClass(cls)}
                className={`px-3 py-1.5 font-mono text-[11px] uppercase border transition-colors ${
                  filterClass === cls
                    ? "bg-[#5C4612]/30 border-[#E3C283] text-[#E3C283]"
                    : "border-[#222220] bg-[#131313] text-[#9A9A94] hover:text-[#F3F0E8]"
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Enrollment Directory Table */}
        <div className="border border-[#222220] bg-[#0E0E0E]">
          <div className="p-4 border-b border-[#222220] flex items-center justify-between">
            <div className="font-mono text-xs uppercase tracking-wider text-[#F3F0E8]">
              REGISTERED COHORT ({filtered.length} SUBJECTS)
            </div>
            <div className="font-mono text-[10px] text-[#9A9A94] uppercase">
              128-D TENSOR SHARDS
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center font-mono text-xs text-[#9A9A94] uppercase tracking-widest">
              QUERYING CALIBRATION REPOSITORY...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center font-mono text-xs text-[#9A9A94] uppercase">
              NO MATCHING BIOMETRIC IDENTITIES FOUND
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#222220] bg-[#131313] text-[#9A9A94] text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4">STUDENT NAME</th>
                    <th className="py-3 px-4">ROLL</th>
                    <th className="py-3 px-4">CLASS / SECTION</th>
                    <th className="py-3 px-4">CALIBRATION STATE</th>
                    <th className="py-3 px-4">CREATED AT</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222220]">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-[#131313]/50 transition-colors">
                      <td className="py-3 px-4 font-sans text-sm text-[#F3F0E8]">
                        <Link
                          href={`/enrollment/${s.id}`}
                          className="hover:text-[#E3C283] transition-colors"
                        >
                          {s.full_name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-[#C9C7BD]">{s.roll_number}</td>
                      <td className="py-3 px-4 text-[#9A9A94]">{s.class_name}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#E3C283]/40 bg-[#5C4612]/20 text-[#E3C283] text-[10px] uppercase">
                          <CheckCircle2 className="w-3 h-3 text-[#E3C283]" />
                          128-D CALIBRATED
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#9A9A94]">
                        {s.created_at ? formatDate(s.created_at) : "—"}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          href={`/enrollment/${s.id}/capture`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 border border-[#222220] bg-[#131313] hover:border-[#E3C283] text-[#C9C7BD] hover:text-[#E3C283] text-[10px] uppercase transition-colors"
                        >
                          <Camera className="w-3 h-3" /> CAPTURE
                        </Link>
                        <Link
                          href={`/enrollment/${s.id}/verify`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 border border-[#E3C283]/40 bg-[#5C4612]/20 text-[#E3C283] hover:bg-[#5C4612]/40 text-[10px] uppercase transition-colors"
                        >
                          <ShieldCheck className="w-3 h-3" /> VERIFY
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
