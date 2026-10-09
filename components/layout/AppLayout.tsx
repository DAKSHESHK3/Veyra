"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Camera,
  Users,
  Fingerprint,
  BookOpen,
  BarChart3,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VeyraMark } from "@/components/visuals/VeyraMark";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connected] = useState(isSupabaseConfigured());

  const navItems = [
    { label: "COMMAND", href: "/dashboard", icon: LayoutDashboard },
    { label: "ATTENDANCE", href: "/attendance", icon: Camera },
    { label: "STUDENTS", href: "/students", icon: Users },
    { label: "ENROLLMENT", href: "/enrollment", icon: Fingerprint },
    { label: "SUBJECTS", href: "/subjects", icon: BookOpen },
    { label: "REPORTS", href: "/reports", icon: BarChart3 },
    { label: "HISTORY", href: "/history", icon: History },
    { label: "SETTINGS", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#090909] text-[#F3F0E8] flex flex-col md:flex-row antialiased">
      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#222220] bg-[#0E0E0E]/90 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5">
          <VeyraMark size={22} />
          <span className="font-sans font-medium text-sm tracking-[0.2em] text-[#F3F0E8]">
            VEYRA
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <span className="font-mono text-[10px] text-[#E3C283] px-2 py-1 border border-[#E3C283]/40 bg-[#5C4612]/30 uppercase">
              CONSOLE
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[#9A9A94]"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Desktop Architectural Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#222220] bg-[#090909] min-h-screen sticky top-0 justify-between select-none shrink-0">
        <div className="flex flex-col">
          {/* Header Mark */}
          <div className="h-16 px-5 border-b border-[#222220] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <VeyraMark size={24} />
              <div className="flex flex-col">
                <span className="font-sans font-medium text-sm tracking-[0.2em] text-[#F3F0E8] group-hover:text-[#E3C283] transition-colors">
                  VEYRA
                </span>
                <span className="font-mono text-[8px] text-[#9A9A94] uppercase tracking-[0.25em]">
                  PRESENCE, VERIFIED.
                </span>
              </div>
            </Link>
            <Link
              href="/"
              title="View Public System Landing Page"
              className="text-[#9A9A94] hover:text-[#E3C283] transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* System Telemetry Chip */}
          <div className="p-3 border-b border-[#222220] bg-[#0E0E0E]">
            <div className="p-2 border border-[#222220] flex flex-col gap-1.5 font-mono text-[9px]">
              <div className="flex items-center justify-between">
                <span className="text-[#9A9A94] tracking-[0.14em]">PIPELINE:</span>
                <span className="text-[#E3C283] flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E3C283] animate-pulse" />
                  WEBGL 2.0 LOCAL
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9A9A94] tracking-[0.14em]">STORAGE:</span>
                <span className="text-[#C9C7BD]">
                  {connected ? "POSTGRES RLS" : "LOCAL CACHE"}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="px-3 pt-4">
            <div className="font-mono text-[9px] uppercase text-[#9A9A94] tracking-[0.25em] px-2 mb-2">
              NAVIGATION // 01-06
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-xs font-mono tracking-[0.14em] uppercase transition-all duration-150 border",
                      isActive
                        ? "bg-[#1C1B1B] text-[#F3F0E8] border-l-2 border-l-[#E3C283] border-t-[#222220] border-r-[#222220] border-b-[#222220]"
                        : "border-transparent text-[#9A9A94] hover:text-[#F3F0E8] hover:bg-[#131313] hover:border-[#222220]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5",
                        isActive ? "text-[#E3C283]" : "text-[#9A9A94]"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Audit Profile & Logout */}
        <div className="p-3 border-t border-[#222220] bg-[#0E0E0E] space-y-2">
          <div className="flex items-center justify-between p-2 border border-[#222220]/80">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[#F3F0E8] uppercase tracking-wider">
                ADMIN CONSOLE
              </span>
              <span className="font-mono text-[8px] text-[#9A9A94] tracking-widest">
                AUTH: CERTIFIED
              </span>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#E3C283]" />
          </div>

          <Link href="/login" className="block">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center text-[10px] tracking-[0.16em] border-[#222220] hover:border-[#FFB4AB] hover:text-[#FFB4AB] h-8"
            >
              <LogOut className="h-3 w-3 mr-2" />
              SIGN OUT
            </Button>
          </Link>
        </div>
      </aside>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#090909]/95 backdrop-blur-md p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#222220] pb-4">
              <div className="flex items-center gap-2.5">
                <VeyraMark size={24} />
                <span className="font-sans font-medium text-base tracking-[0.2em]">
                  VEYRA
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#9A9A94]"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="space-y-2 font-mono text-xs uppercase tracking-[0.14em]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 border transition-colors",
                      isActive
                        ? "border-[#E3C283] bg-[#1C1B1B] text-[#F3F0E8]"
                        : "border-[#222220] text-[#9A9A94] hover:text-[#F3F0E8]"
                    )}
                  >
                    <Icon className="h-4 w-4 text-[#E3C283]" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-[#222220]">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                <LogOut className="h-3.5 w-3.5 mr-2" />
                SIGN OUT
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-[#090909]">
        {/* Subtle Top Architectural Horizon Bar */}
        <div className="hidden md:flex h-16 border-b border-[#222220] px-8 items-center justify-between bg-[#090909]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4 font-mono text-[10px] text-[#9A9A94] tracking-[0.18em] uppercase">
            <span>TERMINAL // {pathname.replace("/", "").toUpperCase() || "ROOT"}</span>
            <span>•</span>
            <span className="text-[#E3C283]">LATENCY: ≤ 18MS</span>
            <span>•</span>
            <span>INFERENCE: 100% CLIENT-SIDE</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/attendance/new">
              <Button variant="champagne" size="sm" className="h-8">
                + TAKE ATTENDANCE
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
