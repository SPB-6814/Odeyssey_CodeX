"use client";

import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const showRecent = pathname.startsWith('/analysis');
  const showMainNav = pathname.startsWith('/analysis');

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 flex flex-col bg-slate-950/40 backdrop-blur-md border-r border-white/5 z-40 hidden md:flex">
      <div className="p-8 flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-3 mb-10 shrink-0">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary animate-ping opacity-50"></div>
          </div>
          <div>
            <p className="font-inter text-[10px] font-bold uppercase tracking-[0.2em] text-white">Sentinel Engine</p>
            <p className="font-inter text-[9px] uppercase tracking-wider text-slate-500">Vigilant Mode Active</p>
          </div>
        </div>
        <div className="flex flex-col gap-6 flex-1 overflow-hidden">
          {/* New Analytics Button */}
          <a href="/" className="shrink-0 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-on-primary hover:brightness-110 rounded-xl font-inter text-[11px] font-bold uppercase tracking-[0.1em] transition-all shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-lg">add</span>
            New Analytics
          </a>

          {/* Main Navigation */}
          {showMainNav && (
            <nav className="space-y-2 shrink-0">
              <a className="flex items-center gap-4 px-4 py-3 bg-white/5 text-white rounded-lg font-inter text-[10px] font-bold uppercase tracking-[0.2em] transition-all group" href="#">
                <span className="material-symbols-outlined text-sm text-primary group-hover:scale-110 transition-transform">analytics</span>
                Analytics
              </a>
              <a className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-slate-200 hover:bg-white/[0.02] rounded-lg font-inter text-[10px] font-bold uppercase tracking-[0.2em] transition-all group" href="#">
                <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">feed</span>
                Feed
              </a>
            </nav>
          )}

          {/* Recent Analytics List */}
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <h3 className="px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3 mt-2 shrink-0">Recent</h3>
            <a className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group" href="/analysis?url=cryptowallet.pro">
              <span className="material-symbols-outlined text-[14px] text-slate-500 group-hover:text-primary transition-colors">history</span>
              <span className="font-body-sm text-[12px] truncate">CryptoWallet Pro Audit</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group" href="/analysis?url=authguard.app">
              <span className="material-symbols-outlined text-[14px] text-slate-500 group-hover:text-primary transition-colors">history</span>
              <span className="font-body-sm text-[12px] truncate">AuthGuard Analysis</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group" href="/analysis?url=defiswap.io">
              <span className="material-symbols-outlined text-[14px] text-slate-500 group-hover:text-primary transition-colors">history</span>
              <span className="font-body-sm text-[12px] truncate">DefiSwap Deep Scan</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group" href="/analysis?url=indiegame.studio">
              <span className="material-symbols-outlined text-[14px] text-slate-500 group-hover:text-primary transition-colors">history</span>
              <span className="font-body-sm text-[12px] truncate">IndieGame Studio Review</span>
            </a>
          </div>
        </div>
      </div>
      <div className="mt-auto p-8 border-t border-white/5 bg-black/20 shrink-0">
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
  );
}
