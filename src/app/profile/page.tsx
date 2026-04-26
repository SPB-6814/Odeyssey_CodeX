"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.displayName || user.email?.split("@")[0] || "Analyst";
  const photoURL = user.photoURL || null;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center relative overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-inter text-[11px] font-bold uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Dashboard
        </Link>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/40 mb-4 shadow-lg shadow-primary/20">
              {photoURL ? (
                <img
                  alt="Profile avatar"
                  className="w-full h-full object-cover"
                  src={photoURL}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold">
                  {initial}
                </div>
              )}
            </div>
            <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
              Active Analyst
            </span>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-8">
            <div className="bg-black/30 border border-white/5 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Full Name</p>
              <p className="text-white font-bold text-base">{displayName}</p>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Email Address</p>
              <p className="text-white font-bold text-base">{user.email || "—"}</p>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Account Type</p>
              <p className="text-white font-bold text-base">Sentinel Analyst</p>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Sign-In Provider</p>
              <p className="text-white font-bold text-base capitalize">
                {user.providerData[0]?.providerId === "google.com" ? "Google" : "Email / Password"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/profile/edit"
              className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] text-center bg-primary hover:bg-primary-fixed text-on-primary transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Details
            </Link>
            <Link
              href="/settings"
              className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] text-center bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
