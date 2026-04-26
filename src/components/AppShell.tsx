"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/ui/Sidebar";
import HeaderProfile from "@/components/HeaderProfile";
import Link from "next/link";

/**
 * AppShell — conditionally renders layout chrome based on auth state.
 *
 *  • Visitor  → minimal top bar (logo + Sign In), no sidebar, full-width content
 *  • Authenticated → full header nav + sidebar + content offset
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  /* ── Loading splash (brief, while Firebase resolves) ── */
  if (loading) {
    return (
      <>
        {/* Minimal header skeleton */}
        <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-slate-950/60 backdrop-blur-xl border-b border-white/5">
          <div className="text-xl font-bold tracking-tighter text-white uppercase font-inter flex items-center gap-2">
            <span className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center text-on-primary text-[10px]">
              S
            </span>
            SentinelReview
          </div>
          <div className="w-24 h-8 bg-white/5 rounded-full animate-pulse" />
        </header>
        <div className="flex-1 pt-16 flex flex-col min-h-screen relative z-10">
          {/* Content shimmer */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                Initializing Sentinel…
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── Visitor layout (no sidebar, no nav) ── */
  if (!user) {
    return (
      <>
        <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-slate-950/60 backdrop-blur-xl border-b border-white/5">
          <Link
            href="/"
            className="text-xl font-bold tracking-tighter text-white uppercase font-inter flex items-center gap-2"
          >
            <span className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center text-on-primary text-[10px]">
              S
            </span>
            SentinelReview
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/auth"
              className="bg-primary hover:bg-primary-fixed text-on-primary px-6 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-primary/20"
            >
              Sign In
            </Link>
          </div>
        </header>

        {/* Full-width content (no sidebar offset) */}
        <div className="flex-1 pt-16 flex flex-col min-h-screen relative z-10">
          {children}
        </div>
      </>
    );
  }

  /* ── Authenticated layout (full sidebar + nav) ── */
  return (
    <>
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-slate-950/60 backdrop-blur-xl border-b border-white/5">
        <Link
          href="/"
          className="text-xl font-bold tracking-tighter text-white uppercase font-inter flex items-center gap-2"
        >
          <span className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center text-on-primary text-[10px]">
            S
          </span>
          SentinelReview
        </Link>

        <nav className="hidden md:flex gap-10 items-center">
          <a
            className="font-inter text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all duration-300"
            href="/"
          >
            Dashboard
          </a>
          <a
            className="font-inter text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all duration-300"
            href="/feed"
          >
            Live Pulse
          </a>

        </nav>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2 font-label-caps text-[10px] rounded-full transition-all"
          >
            AUDIT URL
          </Link>
          <HeaderProfile />
        </div>
      </header>

      {/* SideNavBar (Desktop Only) */}
      <Sidebar />

      {/* Main Content Canvas */}
      <div className="flex-1 ml-0 md:ml-64 pt-16 flex flex-col min-h-screen relative z-10">
        {children}
      </div>
    </>
  );
}
