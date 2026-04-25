import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SentinelReview",
  description: "Vigilance Starts with Clarity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-background min-h-screen flex flex-col selection:bg-primary selection:text-on-primary">
        <div className="fixed inset-0 grid-overlay pointer-events-none opacity-20 z-[-1]"></div>
        
        {/* TopAppBar */}
        <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-slate-950/60 backdrop-blur-xl border-b border-white/5">
          <div className="text-xl font-bold tracking-tighter text-white uppercase font-inter flex items-center gap-2">
            <span className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center text-on-primary text-[10px]">S</span>
            SentinelReview
          </div>
          <nav className="hidden md:flex gap-10 items-center">
            <a className="font-inter text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all duration-300" href="#">Dashboard</a>
            <a className="font-inter text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all duration-300" href="#">Live Pulse</a>
            <a className="font-inter text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all duration-300" href="#">Audits</a>
            <a className="font-inter text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all duration-300" href="#">Documentation</a>
          </nav>
          <div className="flex items-center gap-6">
            <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2 font-label-caps text-[10px] rounded-full transition-all">AUDIT URL</button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-surface-container shadow-lg shadow-black/50 ring-1 ring-white/5">
              <img alt="Analyst profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFJaeJjheWwFJPaNG221m4vRhva6BBtfsru-ugVbD5aUV2RzX0Ze04GfP6EDyALxROf-IT07KZowf_asetH_pur9rhl6B-SeN6o-3CXhGNeX0cNJDP4ssvxRFZLD6lIPYBuKlloXJBDKlCn4v7t9ddWxYccEStsWV1pwJqUVG8PY6nW5ljuF3f-hZiKEPKM3wrad9kYZ4srBSZCLqBd8HVjZXfSXqs_mWfx1ryWKRlUChSnv5EJT9WLyr7qRWf1W-0iuh7-hFSYY5V" />
            </div>
          </div>
        </header>

        {/* SideNavBar (Desktop Only) */}
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 flex flex-col bg-slate-950/40 backdrop-blur-md border-r border-white/5 z-40 hidden md:flex">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-10">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary animate-ping opacity-50"></div>
              </div>
              <div>
                <p className="font-inter text-[10px] font-bold uppercase tracking-[0.2em] text-white">Sentinel Engine</p>
                <p className="font-inter text-[9px] uppercase tracking-wider text-slate-500">Vigilant Mode Active</p>
              </div>
            </div>
            <nav className="space-y-2">
              <a className="flex items-center gap-4 px-4 py-3 bg-white/5 text-white rounded-lg font-inter text-[10px] font-bold uppercase tracking-[0.2em] transition-all group" href="#">
                <span className="material-symbols-outlined text-sm text-primary group-hover:scale-110 transition-transform">Analytics</span>
                Analytics
              </a>
              <a className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-slate-200 hover:bg-white/[0.02] rounded-lg font-inter text-[10px] font-bold uppercase tracking-[0.2em] transition-all group" href="#">
                <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">Feed</span>
                Feed
              </a>
            </nav>
          </div>
          <div className="mt-auto p-8 border-t border-white/5 bg-black/20">
            <button className="w-full bg-primary text-on-primary font-label-caps text-[11px] py-4 rounded-lg tracking-[0.2em] uppercase mb-8 hover:brightness-110 shadow-lg shadow-primary/20 transition-all">Export Report</button>
            <div className="space-y-4">
              <a className="flex items-center gap-4 px-2 text-slate-500 hover:text-slate-200 font-inter text-[10px] font-bold uppercase tracking-[0.2em] transition-all" href="#">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                Security
              </a>
              <a className="flex items-center gap-4 px-2 text-slate-500 hover:text-slate-200 font-inter text-[10px] font-bold uppercase tracking-[0.2em] transition-all" href="#">
                <span className="material-symbols-outlined text-sm">help_center</span>
                Support
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <div className="flex-1 ml-0 md:ml-64 pt-16 flex flex-col min-h-screen relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
