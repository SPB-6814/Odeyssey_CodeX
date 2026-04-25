"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HeaderProfile() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const checkName = () => {
      const storedName = localStorage.getItem("userName");
      if (storedName) {
        setUserName(storedName);
      }
    };

    // Check on mount
    checkName();

    // Listen for storage changes in case it happens in another tab
    window.addEventListener("storage", checkName);
    
    // We can also poll or use a custom event to update it immediately in the same window
    // without full page reload if the user logs in from the modal.
    const interval = setInterval(checkName, 1000);

    return () => {
      window.removeEventListener("storage", checkName);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center gap-4">
      {userName && (
        <span className="font-inter text-xs font-bold text-white tracking-wide bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          {userName}
        </span>
      )}
      <Link href="/auth" className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-surface-container shadow-lg shadow-black/50 ring-1 ring-white/5 hover:ring-primary/50 transition-all cursor-pointer block">
        <img alt="Analyst profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFJaeJjheWwFJPaNG221m4vRhva6BBtfsru-ugVbD5aUV2RzX0Ze04GfP6EDyALxROf-IT07KZowf_asetH_pur9rhl6B-SeN6o-3CXhGNeX0cNJDP4ssvxRFZLD6lIPYBuKlloXJBDKlCn4v7t9ddWxYccEStsWV1pwJqUVG8PY6nW5ljuF3f-hZiKEPKM3wrad9kYZ4srBSZCLqBd8HVjZXfSXqs_mWfx1ryWKRlUChSnv5EJT9WLyr7qRWf1W-0iuh7-hFSYY5V" />
      </Link>
    </div>
  );
}
