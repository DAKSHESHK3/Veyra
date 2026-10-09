"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  Camera,
  Trash2,
  ExternalLink,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
    if (confirm(`Are you sure you want to delete ${name}? All biometric embeddings will be removed.`)) {
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Student Directory</h1>
            <p className="text-sm text-muted-foreground">
              Manage student enrollment rosters and biometric facial profiles
            </p>
          </div>
          <Link href="/students/new">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Enroll New Student
            </Button>
          </Link>
        </div>

        {/* Search & Class Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Filter Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-10 rounded-lg border border-input bg-background/50 px-3 text-xs"
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Students Table */}
        <Card className="border-border/80 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <Users className="h-10 w-10 mx-auto text-muted-foreground/60" />
                <p className="text-base font-medium">No students found</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {search
                    ? "No student matches the search filter."
                    : "No students are enrolled yet. Launch the enrollment wizard to add your first student."}
                </p>
                <Link href="/students/new">
                  <Button size="sm" className="mt-2">
                    Enroll Student
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] uppercase tracking-wider text-muted-foreground border-b bg-muted/40">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Class & Sem</th>
                      <th className="py-3 px-4">Biometric Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filtered.map((student) => (
                      <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                              {student.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">
                                {student.full_name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {student.email || "No email assigned"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-foreground">
                          {student.roll_number}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {student.class_name} • {student.semester}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="success" className="text-[10px] gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Enrolled (128-d)
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/students/${student.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                              onClick={() => handleDelete(student.id, student.full_name)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
