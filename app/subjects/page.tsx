"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Search, CheckCircle, XCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

      // Reset form
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Academic Subjects</h1>
            <p className="text-sm text-muted-foreground">
              Dynamic courses, class departments, and lecture assignments
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or class..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Subjects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
        ) : filteredSubjects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-3">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/60" />
              <p className="text-base font-medium">No subjects found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {search ? "No subjects matched your filter." : "Create your first subject to schedule attendance sessions."}
              </p>
              <Button size="sm" onClick={() => setIsModalOpen(true)} className="mt-2">
                Create Subject
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((subject) => (
              <Card key={subject.id} className="border-border/80 shadow-sm hover:border-primary/40 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-foreground">
                        {subject.code}
                      </span>
                      <CardTitle className="text-base font-semibold mt-2">{subject.name}</CardTitle>
                    </div>
                    <Badge variant={subject.is_active ? "success" : "secondary"}>
                      {subject.is_active ? "Active" : "Archived"}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs pt-1">
                    {subject.class_name} • {subject.semester}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-[11px] text-muted-foreground border-t pt-3 flex justify-between">
                    <span>Registered in catalog</span>
                    <span className="font-medium text-foreground">Ready for sessions</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Subject Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-border/80 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Add Academic Subject</CardTitle>
                <CardDescription className="text-xs">
                  Create a new lecture or lab course for biometric attendance tracking
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateSubject}>
                <CardContent className="space-y-4">
                  {formError && (
                    <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Subject Title</label>
                    <Input
                      required
                      placeholder="e.g. English Literature, Data Structures"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Subject Code</label>
                    <Input
                      required
                      placeholder="e.g. ENG101, CS301"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">Class / Batch</label>
                      <Input
                        required
                        placeholder="e.g. CS-5th, IT-3rd"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">Semester</label>
                      <Input
                        required
                        placeholder="e.g. 5th Semester"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <div className="p-6 pt-0 flex justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    Save Subject
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
