import type { Metadata } from "next";
import { Inter } from "next/font/google";
<<<<<<< Updated upstream
import { Sidebar } from "@/components/ui/Sidebar";
=======
import Link from "next/link";
import HeaderProfile from "@/components/HeaderProfile";
>>>>>>> Stashed changes
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
            <HeaderProfile />
          </div>
        </header>

        {/* SideNavBar (Desktop Only) */}
        <Sidebar />

        {/* Main Content Canvas */}
        <div className="flex-1 ml-0 md:ml-64 pt-16 flex flex-col min-h-screen relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
