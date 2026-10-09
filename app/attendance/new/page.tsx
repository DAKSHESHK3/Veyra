"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, Sparkles, BookOpen, Clock } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
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
      <div className="max-w-xl mx-auto space-y-6">
        <Link href="/attendance" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Sessions List
        </Link>

        <Card className="border-border/80 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Launch Live Attendance Session</CardTitle>
                <CardDescription className="text-xs">
                  Configure lecture parameters and activate real-time facial recognition
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleStartSession}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Subject / Lecture Course *</label>
                {loading ? (
                  <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
                ) : subjects.length === 0 ? (
                  <div className="p-3 text-xs border rounded-lg bg-muted/40">
                    No subjects found.{" "}
                    <Link href="/subjects" className="text-primary underline">
                      Create a subject first
                    </Link>
                  </div>
                ) : (
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full h-10 rounded-lg border border-input bg-background/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Class / Batch</label>
                  <Input
                    required
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Semester</label>
                  <Input
                    required
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1">
                <span className="font-semibold text-foreground block">Session Security & Duplicate Prevention</span>
                <p>
                  Once started, the camera room matches active video frames against enrolled student embeddings. Each student can only be verified once per session.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end pt-2">
              <Button type="submit" isLoading={isSubmitting} disabled={loading || subjects.length === 0}>
                <Camera className="h-4 w-4 mr-2" />
                Start Camera Session
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
