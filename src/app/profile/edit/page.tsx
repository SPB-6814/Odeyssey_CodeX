"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
      return;
    }
    if (user) {
      setName(user.displayName || "");
    }
  }, [loading, user, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;

    setSaving(true);
    setErrorMsg(null);

    try {
      await updateProfile(user, { displayName: name.trim() });
      setSaved(true);
      setTimeout(() => {
        router.push("/profile");
      }, 1200);
    } catch {
      setErrorMsg("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center relative overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/profile" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-inter text-[11px] font-bold uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Profile
        </Link>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <span className="material-symbols-outlined text-primary text-2xl">edit</span>
            </div>
            <h1 className="font-h2 text-2xl font-bold text-white mb-2">Edit Details</h1>
            <p className="text-slate-400 text-sm">Update your profile information below.</p>
          </div>

          {saved && (
            <div className="mb-6 flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-green-400 text-xl">check_circle</span>
              <p className="text-green-400 text-sm font-bold">Changes saved! Redirecting…</p>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 flex items-center gap-3 bg-error/10 border border-error/20 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-error text-xl">error</span>
              <p className="text-error text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">person</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setSaved(false); }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-body-sm"
                  placeholder="Your full name"
                  required
                  disabled={saving || saved}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">mail</span>
                <input
                  type="email"
                  value={user.email || ""}
                  readOnly
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-slate-400 font-body-sm cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-slate-600 mt-1 ml-1">Email cannot be changed here.</p>
            </div>

            <button
              type="submit"
              disabled={!name.trim() || saved || saving}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-[12px] transition-all shadow-lg mt-4 flex items-center justify-center gap-2 ${
                name.trim() && !saved && !saving
                  ? "bg-primary hover:bg-primary-fixed text-on-primary shadow-primary/20 cursor-pointer"
                  : "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed"
              }`}
            >
              {saving && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
              {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
