"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName") || "";
    const email = localStorage.getItem("userEmail") || "";
    if (!name) {
      router.replace("/auth");
      return;
    }
    setUserName(name);
    setUserEmail(email);
  }, [router]);

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
              <img
                alt="Profile avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFJaeJjheWwFJPaNG221m4vRhva6BBtfsru-ugVbD5aUV2RzX0Ze04GfP6EDyALxROf-IT07KZowf_asetH_pur9rhl6B-SeN6o-3CXhGNeX0cNJDP4ssvxRFZLD6lIPYBuKlloXJBDKlCn4v7t9ddWxYccEStsWV1pwJqUVG8PY6nW5ljuF3f-hZiKEPKM3wrad9kYZ4srBSZCLqBd8HVjZXfSXqs_mWfx1ryWKRlUChSnv5EJT9WLyr7qRWf1W-0iuh7-hFSYY5V"
              />
            </div>
            <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
              Active Analyst
            </span>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-8">
            <div className="bg-black/30 border border-white/5 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Full Name</p>
              <p className="text-white font-bold text-base">{userName || "—"}</p>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Email Address</p>
              <p className="text-white font-bold text-base">{userEmail || "—"}</p>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Account Type</p>
              <p className="text-white font-bold text-base">Sentinel Analyst</p>
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
