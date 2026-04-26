"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoScan, setAutoScan] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
      return;
    }
    // Load preferences if stored
    const prefs = localStorage.getItem("userPrefs");
    if (prefs) {
      const p = JSON.parse(prefs);
      setNotifications(p.notifications ?? true);
      setDarkMode(p.darkMode ?? true);
      setAutoScan(p.autoScan ?? false);
      setTwoFA(p.twoFA ?? false);
    }
  }, [loading, user, router]);

  const handleSave = () => {
    localStorage.setItem("userPrefs", JSON.stringify({ notifications, darkMode, autoScan, twoFA }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const Toggle = ({ on, onToggle, label, description, icon }: {
    on: boolean; onToggle: () => void; label: string; description: string; icon: string;
  }) => (
    <div className="flex items-start justify-between gap-4 bg-black/30 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-slate-400 text-xl mt-0.5">{icon}</span>
        <div>
          <p className="text-sm font-bold text-white">{label}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-all shrink-0 mt-0.5 ${on ? "bg-primary" : "bg-white/10"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${on ? "left-5" : "left-0.5"}`}></span>
      </button>
    </div>
  );

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
              <span className="material-symbols-outlined text-primary text-2xl">settings</span>
            </div>
            <h1 className="font-h2 text-2xl font-bold text-white mb-2">Settings</h1>
            <p className="text-slate-400 text-sm">Customize your SentinelReview experience.</p>
          </div>

          {saved && (
            <div className="mb-6 flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-green-400 text-xl">check_circle</span>
              <p className="text-green-400 text-sm font-bold">Preferences saved!</p>
            </div>
          )}

          <div className="space-y-3 mb-8">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1 mb-3">Preferences</p>
            <Toggle
              on={notifications}
              onToggle={() => setNotifications(!notifications)}
              label="Threat Alerts"
              description="Receive real-time notifications for flagged content."
              icon="notifications"
            />
            <Toggle
              on={darkMode}
              onToggle={() => setDarkMode(!darkMode)}
              label="Dark Mode"
              description="Use the dark theme across the dashboard."
              icon="dark_mode"
            />
            <Toggle
              on={autoScan}
              onToggle={() => setAutoScan(!autoScan)}
              label="Auto-Scan URLs"
              description="Automatically scan URLs as they are entered."
              icon="radar"
            />

            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1 mt-5 mb-3">Security</p>
            <Toggle
              on={twoFA}
              onToggle={() => setTwoFA(!twoFA)}
              label="Two-Factor Authentication"
              description="Add an extra layer of protection to your account."
              icon="security"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-[12px] bg-primary hover:bg-primary-fixed text-on-primary transition-all shadow-lg shadow-primary/20"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
