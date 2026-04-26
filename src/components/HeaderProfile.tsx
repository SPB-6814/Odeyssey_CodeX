"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HeaderProfile() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    router.push("/auth");
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Analyst";
  const photoURL = user?.photoURL || null;

  // Fallback avatar: first letter of display name
  const initial = displayName.charAt(0).toUpperCase();

  if (!user) {
    return (
      <Link
        href="/auth"
        className="bg-primary hover:bg-primary-fixed text-on-primary px-5 py-2 font-label-caps text-[10px] rounded-full transition-all shadow-lg shadow-primary/20"
      >
        SIGN IN
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4 relative">
      <span className="font-inter text-xs font-bold text-white tracking-wide bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
        {displayName}
      </span>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className={`w-8 h-8 rounded-full overflow-hidden border bg-surface-container shadow-lg shadow-black/50 transition-all cursor-pointer block ${
            dropdownOpen
              ? "border-primary ring-1 ring-primary/50"
              : "border-white/20 ring-1 ring-white/5 hover:ring-primary/50"
          }`}
        >
          {photoURL ? (
            <img alt="Profile" src={photoURL} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
              {initial}
            </div>
          )}
        </button>

        {dropdownOpen && (
          <>
            {/* Click-outside overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />

            {/* Dropdown panel */}
            <div className="absolute right-0 mt-3 w-52 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 z-50">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">
                  Signed in as
                </p>
                <p className="text-sm font-bold text-white truncate">{displayName}</p>
                {user.email && (
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                )}
              </div>

              {/* Profile */}
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  person
                </span>
                My Profile
              </Link>

              {/* Edit Details */}
              <Link
                href="/profile/edit"
                onClick={() => setDropdownOpen(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  edit
                </span>
                Edit Details
              </Link>

              {/* Settings */}
              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  settings
                </span>
                Settings
              </Link>

              <div className="h-px bg-white/5 my-1" />

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors flex items-center gap-3 font-bold"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
