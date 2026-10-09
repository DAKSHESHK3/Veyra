"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  ShieldCheck,
  CheckCircle2,
  Fingerprint,
  RotateCcw,
  User,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { dbService } from "@/services/db";
import { Student } from "@/types";
import { formatDate } from "@/lib/utils";

export default function EnrollmentRecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await dbService.getStudentById(id);
        setStudent(data);
      } catch (err) {
        console.error("Failed loading student:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="py-24 text-center font-mono text-xs text-[#9A9A94] uppercase tracking-widest">
          RETRIEVING BIOMETRIC CALIBRATION RECORD...
        </div>
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout>
        <div className="py-24 text-center">
          <p className="font-mono text-sm text-[#C9C7BD] mb-4">
            ENROLLMENT TARGET NOT FOUND
          </p>
          <Link
            href="/enrollment"
            className="font-mono text-xs text-[#E3C283] hover:underline"
          >
            &larr; RETURN TO ENROLLMENT REGISTRY
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-[#222220] pb-4">
          <Link
            href="/enrollment"
            className="text-[#9A9A94] hover:text-[#E3C283] font-mono text-xs flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> ENROLLMENT REGISTRY
          </Link>
          <span className="font-mono text-[10px] uppercase text-[#E3C283] tracking-widest">
            SHARD STATUS // 128-D EMBEDDED
          </span>
        </div>

        <div className="border border-[#222220] bg-[#0E0E0E] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222220] pb-6 mb-6">
            <div>
              <div className="font-mono text-[10px] uppercase text-[#E3C283] tracking-widest mb-1 flex items-center gap-2">
                <Fingerprint className="w-3.5 h-3.5" />
                CALIBRATED BIOMETRIC IDENTITY
              </div>
              <h1 className="text-2xl font-light text-[#F3F0E8] uppercase tracking-tight">
                {student.full_name}
              </h1>
              <div className="font-mono text-xs text-[#9A9A94] mt-1">
                ROLL: {student.roll_number} &bull; CLASS: {student.class_name} &bull; SEMESTER: {student.semester}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href={`/enrollment/${student.id}/capture`}>
                <Button variant="outline" size="sm" className="font-mono text-xs uppercase">
                  <Camera className="w-3.5 h-3.5 mr-1.5" /> RE-CAPTURE POSES
                </Button>
              </Link>
              <Link href={`/enrollment/${student.id}/verify`}>
                <Button variant="champagne" size="sm" className="font-mono text-xs uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> RUN LIVE VERIFICATION
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border border-[#222220] bg-[#131313]">
              <div className="font-mono text-[10px] text-[#9A9A94] uppercase mb-1">
                VECTOR DIMENSIONS
              </div>
              <div className="font-mono text-xl text-[#F3F0E8]">128 FLOATS</div>
              <div className="font-mono text-[10px] text-[#E3C283] mt-1">
                L2 NORMALIZED (UNIT SPHERE)
              </div>
            </div>

            <div className="p-4 border border-[#222220] bg-[#131313]">
              <div className="font-mono text-[10px] text-[#9A9A94] uppercase mb-1">
                CALIBRATION SAMPLES
              </div>
              <div className="font-mono text-xl text-[#E3C283]">24 SAMPLES</div>
              <div className="font-mono text-[10px] text-[#9A9A94] mt-1">
                FRONTAL / LEFT 15&deg; / RIGHT 15&deg;
              </div>
            </div>

            <div className="p-4 border border-[#222220] bg-[#131313]">
              <div className="font-mono text-[10px] text-[#9A9A94] uppercase mb-1">
                MATCHING THRESHOLD
              </div>
              <div className="font-mono text-xl text-[#F3F0E8]">&tau; &le; 0.50</div>
              <div className="font-mono text-[10px] text-[#9A9A94] mt-1">
                TEMPORAL BUFFER: 5 FRAMES
              </div>
            </div>
          </div>

          <div className="border border-[#222220] bg-[#090909] p-4 font-mono text-xs text-[#9A9A94] space-y-2">
            <div className="text-[#F3F0E8] text-[11px] uppercase font-semibold">
              LOCAL VECTOR PRIVACY ISOLATION
            </div>
            <p className="text-[10px] leading-relaxed">
              Biometric mathematical descriptors are computed client-side in WebGL memory. Raw optical feeds are never uploaded or persisted on server disks.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
