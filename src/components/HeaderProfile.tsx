"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HeaderProfile() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const checkName = () => {
      const storedName = localStorage.getItem("userName");
      setUserName(storedName || null);
    };

    checkName();
    window.addEventListener("storage", checkName);
    const interval = setInterval(checkName, 800);

    return () => {
      window.removeEventListener("storage", checkName);
      clearInterval(interval);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setUserName(null);
    setDropdownOpen(false);
    router.push("/auth");
  };

  const profileImgUrl =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCFJaeJjheWwFJPaNG221m4vRhva6BBtfsru-ugVbD5aUV2RzX0Ze04GfP6EDyALxROf-IT07KZowf_asetH_pur9rhl6B-SeN6o-3CXhGNeX0cNJDP4ssvxRFZLD6lIPYBuKlloXJBDKlCn4v7t9ddWxYccEStsWV1pwJqUVG8PY6nW5ljuF3f-hZiKEPKM3wrad9kYZ4srBSZCLqBd8HVjZXfSXqs_mWfx1ryWKRlUChSnv5EJT9WLyr7qRWf1W-0iuh7-hFSYY5V";

  return (
    <div className="flex items-center gap-4 relative">
      {userName && (
        <span className="font-inter text-xs font-bold text-white tracking-wide bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          {userName}
        </span>
      )}

      {!userName ? (
        /* Not logged in → go to auth page */
        <Link
          href="/auth"
          className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-surface-container shadow-lg shadow-black/50 ring-1 ring-white/5 hover:ring-primary/50 transition-all cursor-pointer block"
        >
          <img alt="Analyst profile" src={profileImgUrl} />
        </Link>
      ) : (
        /* Logged in → show dropdown */
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className={`w-8 h-8 rounded-full overflow-hidden border bg-surface-container shadow-lg shadow-black/50 transition-all cursor-pointer block ${
              dropdownOpen
                ? "border-primary ring-1 ring-primary/50"
                : "border-white/20 ring-1 ring-white/5 hover:ring-primary/50"
            }`}
          >
            <img alt="Analyst profile" src={profileImgUrl} />
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
                  <p className="text-sm font-bold text-white truncate">{userName}</p>
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
      )}
    </div>
  );
}
