"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@institution.edu");
  const [password, setPassword] = useState("admin12345");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured() && supabase) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
      } else {
        // Local dev simulate login delay
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: "admin" | "teacher") => {
    if (role === "admin") {
      setEmail("admin@institution.edu");
      setPassword("admin12345");
    } else {
      setEmail("teacher@institution.edu");
      setPassword("teacher12345");
    }
    setTimeout(() => {
      router.push("/dashboard");
    }, 200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 items-center justify-center text-primary-foreground shadow-lg shadow-primary/25">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Smart Attendance Portal</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access biometric attendance & class rosters
          </p>
        </div>

        <Card className="border-border/80 shadow-md">
          <form onSubmit={handleLogin}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Staff Authentication</CardTitle>
              <CardDescription>
                Enter your administrative or faculty credentials
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email Address
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Password
                </label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Sign In to Portal
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <div className="w-full pt-2 border-t border-border/60">
                <p className="text-[11px] text-muted-foreground text-center mb-2">
                  Quick Access Demo Accounts:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin("admin")}
                    className="text-xs"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 mr-1 text-primary" />
                    Admin Demo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin("teacher")}
                    className="text-xs"
                  >
                    Teacher Demo
                  </Button>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            &larr; Return to public home page
          </Link>
        </p>
      </div>
    </div>
  );
}
