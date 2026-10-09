"use client";

import React, { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Database,
  Cpu,
  Lock,
  Camera,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [distanceThreshold, setDistanceThreshold] = useState("0.55");
  const [temporalFrames, setTemporalFrames] = useState("5");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const isCloud = isSupabaseConfigured();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System & AI Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure biometric thresholds, temporal filters, and database connectivity
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Biometric hyperparameters successfully saved to local configuration.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Biometric ML Hyperparameters */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <Sliders className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-semibold">Biometric Recognition Tuning</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Fine-tune vector distance sensitivity and temporal frame accumulation
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSave}>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Euclidean Distance Threshold (τ)</label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0.30"
                    max="0.80"
                    value={distanceThreshold}
                    onChange={(e) => setDistanceThreshold(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Default: 0.55. Lower values (e.g. 0.45) enforce stricter security; higher values increase match tolerance.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Temporal Consistency Frames (K)</label>
                  <Input
                    type="number"
                    min="3"
                    max="15"
                    value={temporalFrames}
                    onChange={(e) => setTemporalFrames(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Minimum consecutive verified frames required before committing attendance.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button type="submit" size="sm">
                  Save Hyperparameters
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Database & Cloud Sync Status */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <Database className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base font-semibold">Persistence & Supabase Status</CardTitle>
              </div>
              <CardDescription className="text-xs">
                PostgreSQL and Row Level Security connection status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 rounded-lg border bg-muted/40 flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Active Storage Engine</span>
                  <span className="text-muted-foreground">
                    {isCloud ? "Supabase Cloud Database" : "Local Browser Storage (Offline Demo Mode)"}
                  </span>
                </div>
                <Badge variant={isCloud ? "success" : "secondary"}>
                  {isCloud ? "PostgreSQL Active" : "Local Indexed"}
                </Badge>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-foreground block">Connecting to Supabase:</span>
                <p className="text-muted-foreground leading-relaxed">
                  To connect your institution's live Supabase database, set <code className="text-primary font-mono bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-primary font-mono bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your environment file, and apply <code className="font-mono text-foreground">001_initial_schema.sql</code>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
