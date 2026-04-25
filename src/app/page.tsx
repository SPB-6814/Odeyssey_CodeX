"use client";
import React, { useEffect, useRef } from "react";

export default function Home() {
  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationId: number;
    const autoScroll = (ref: React.RefObject<HTMLDivElement | null>) => {
      if (ref.current && !ref.current.matches(':hover')) {
        ref.current.scrollTop += 0.5;
        // Loop back seamlessly assuming the list is duplicated exactly once
        if (ref.current.scrollTop >= ref.current.scrollHeight / 2) {
          ref.current.scrollTop -= ref.current.scrollHeight / 2;
        }
      }
    };
    const loop = () => {
      autoScroll(scrollRef1);
      autoScroll(scrollRef2);
      animationId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <>
      <main className="flex-1 p-8 overflow-x-hidden">
        {/* Hero Search Section */}
        <section className="h-[520px] flex flex-col items-center justify-center relative overflow-hidden rounded-2xl mb-8 group">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-[#050507]">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] opacity-50"></div>
            <img alt="Abstract data grid" className="w-full h-full object-cover mix-blend-overlay opacity-30 transition-transform duration-[20s] group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-PwMvLJ4mt0bcHg32lB3cHsXjwXvlhnfDDMizj5dNEUU2FKINkIlHSf2x5iXTiDumZ6zBbA1fx1-bKZe0ivbG2hDKNkjaHiNMBzw9Dqgx5-txgpBxrcnRWc9i31ecypBILW2Ker8C-mye7cYQnulQGnJUn6V3GVbxDyh5d25ckwMkf6JonzY_ekR22sUWzIFOZGKbAb3iezb6HLn6UMSrp7fSOACGvC63nWaPsv3UPzWegMX0mAnYQ-j4UNpXOwGBSeAYbxO25Eby"/>
          </div>
          <div className="relative z-10 w-full max-w-4xl px-8 text-center">
            <h1 className="font-h1 text-[56px] leading-[1] font-bold text-white mb-6 tracking-[-0.05em]">
              Vigilance Starts <span className="text-primary italic">with</span> Clarity
            </h1>
            <p className="font-body-lg text-lg text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Instant transparency for any digital asset. SentinelReview audits URLs for malicious signals, coordinated disinformation, and compliance risk.
            </p>
            {/* Central Audit Input */}
            <form action="/analysis" className="glow-border relative max-w-2xl mx-auto flex items-center bg-slate-900/60 backdrop-blur-md border border-white/10 p-2 rounded-2xl transition-all shadow-2xl">
              <span className="material-symbols-outlined text-slate-500 ml-5">search</span>
              <input name="url" className="flex-1 bg-transparent border-none text-white font-body-lg focus:ring-0 px-5 py-4 placeholder:text-slate-600 text-lg outline-none" placeholder="Paste product URL for deep audit analysis..." type="text" required/>
              <button type="submit" className="bg-primary hover:bg-primary-fixed text-on-primary px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-[12px] transition-all shadow-lg shadow-primary/20 cursor-pointer">Audit</button>
            </form>
            <div className="mt-12 flex justify-center gap-10">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                <span className="font-label-caps text-[9px] uppercase tracking-[0.2em] text-slate-500">SOC-2 COMPLIANT</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                <span className="font-label-caps text-[9px] uppercase tracking-[0.2em] text-slate-500">REAL-TIME SIGNALS</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                <span className="font-label-caps text-[9px] uppercase tracking-[0.2em] text-slate-500">AI COORDINATION DETECTION</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Insights */}
        <div className="bento-grid">
          {/* False Negative Showcase */}
          <div className="glass-panel col-span-12 md:col-span-6 rounded-2xl p-8 flex flex-col overflow-hidden relative">
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-error text-xl">policy</span>
                </div>
                <h2 className="font-h2 text-xl font-bold text-white uppercase tracking-wider">False Negative</h2>
              </div>
              <div className="flex gap-3">
                <span className="px-4 py-1.5 bg-error/10 text-error border border-error/20 font-bold text-[9px] tracking-[0.15em] rounded-full uppercase">MISSED THREATS</span>
              </div>
            </div>
            
            <div className="flex-1 h-[380px] relative rounded-xl border border-white/5 bg-black/40 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#050507] to-transparent z-10 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#050507] to-transparent z-10 pointer-events-none"></div>
              
              <div ref={scrollRef1} className="h-full w-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex flex-col px-4 py-4 gap-2">
                  {[
                    { title: "CryptoWallet Pro", status: "Flagged Safe", issue: "Malware Payload Detected", time: "2m ago" },
                    { title: "SecureVPN Ext", status: "Clean Scan", issue: "Data Exfiltration", time: "15m ago" },
                    { title: "DefiSwap Portal", status: "No Threat", issue: "Phishing Redirect", time: "1h ago" },
                    { title: "AuthGuard App", status: "Trusted", issue: "Credential Harvesting", time: "3h ago" },
                    { title: "CryptoWallet Pro", status: "Flagged Safe", issue: "Malware Payload Detected", time: "2m ago" },
                    { title: "SecureVPN Ext", status: "Clean Scan", issue: "Data Exfiltration", time: "15m ago" },
                    { title: "DefiSwap Portal", status: "No Threat", issue: "Phishing Redirect", time: "1h ago" },
                    { title: "AuthGuard App", status: "Trusted", issue: "Credential Harvesting", time: "3h ago" }
                  ].map((item, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors shrink-0">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-bold text-white text-[12px]">{item.title}</span>
                        <span className="font-data-mono text-[9px] text-slate-500">{item.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 text-[9px] rounded border border-green-500/20 whitespace-nowrap">{item.status}</span>
                        <span className="material-symbols-outlined text-[12px] text-slate-500">arrow_right_alt</span>
                        <span className="px-1.5 py-0.5 bg-error/10 text-error text-[9px] rounded border border-error/20 font-bold whitespace-nowrap">{item.issue}</span>
                      </div>
                      <p className="font-body-sm text-[10px] text-slate-400 leading-snug">Post-analysis revealed advanced evasion techniques bypassing initial heuristics.</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* False Positive Showcase */}
          <div className="glass-panel col-span-12 md:col-span-6 rounded-2xl p-8 flex flex-col overflow-hidden relative">
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-500 text-xl">verified_user</span>
                </div>
                <h2 className="font-h2 text-xl font-bold text-white uppercase tracking-wider">False Positive</h2>
              </div>
              <div className="flex gap-3">
                <span className="px-4 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 font-bold text-[9px] tracking-[0.15em] rounded-full uppercase">WRONGFULLY FLAGGED</span>
              </div>
            </div>
            
            <div className="flex-1 h-[380px] relative rounded-xl border border-white/5 bg-black/40 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#050507] to-transparent z-10 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#050507] to-transparent z-10 pointer-events-none"></div>
              
              <div ref={scrollRef2} className="h-full w-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex flex-col px-4 py-4 gap-2">
                  {[
                    { title: "IndieGame Studio", status: "Blocked", resolution: "Verified Authentic", time: "10m ago" },
                    { title: "CharityFund DAO", status: "High Risk", resolution: "Legitimate Entity", time: "45m ago" },
                    { title: "LocalNews Blog", status: "Bot Activity", resolution: "Organic Viral Traffic", time: "2h ago" },
                    { title: "ArtisanMarket", status: "Scam Warning", resolution: "Secure Transactions", time: "5h ago" },
                    { title: "IndieGame Studio", status: "Blocked", resolution: "Verified Authentic", time: "10m ago" },
                    { title: "CharityFund DAO", status: "High Risk", resolution: "Legitimate Entity", time: "45m ago" },
                    { title: "LocalNews Blog", status: "Bot Activity", resolution: "Organic Viral Traffic", time: "2h ago" },
                    { title: "ArtisanMarket", status: "Scam Warning", resolution: "Secure Transactions", time: "5h ago" }
                  ].map((item, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors shrink-0">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-bold text-white text-[12px]">{item.title}</span>
                        <span className="font-data-mono text-[9px] text-slate-500">{item.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="px-1.5 py-0.5 bg-error/10 text-error text-[9px] rounded border border-error/20 whitespace-nowrap">{item.status}</span>
                        <span className="material-symbols-outlined text-[12px] text-slate-500">arrow_right_alt</span>
                        <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 text-[9px] rounded border border-green-500/20 font-bold whitespace-nowrap">{item.resolution}</span>
                      </div>
                      <p className="font-body-sm text-[10px] text-slate-400 leading-snug">Manual review and extended behavioral context confirmed legitimate operations.</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Clean Reviews Grid */}
          <div className="col-span-12 mt-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-500 text-xl">star</span>
              </div>
              <h2 className="font-h2 text-xl font-bold text-white uppercase tracking-wider">Product With Good Clean Review</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Product 1 */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-8 hover:bg-white/[0.08] transition-all cursor-pointer group flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-blue-400 text-2xl">laptop_mac</span>
                  </div>
                  <div className="flex text-yellow-500">
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span className="material-symbols-outlined text-sm">star</span>
                  </div>
                </div>
                <h4 className="font-h3 text-lg text-white mb-2 font-bold">ZenBook Pro 15</h4>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded border border-green-500/20 font-bold uppercase">100% Verified Clean</span>
                </div>
                <div className="bg-black/40 rounded-xl p-4 mt-auto border border-white/5 relative">
                  <span className="material-symbols-outlined absolute -top-3 -left-2 text-slate-600 text-3xl opacity-50">format_quote</span>
                  <p className="font-body-sm text-slate-300 italic text-sm relative z-10">"Exceptional build quality and no bloatware out of the box. SentinelScan shows zero bundled adware or tracking telemetry."</p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">JD</div>
                    <span className="text-[10px] text-slate-400">Verified Tech Reviewer</span>
                  </div>
                </div>
              </div>

              {/* Product 2 */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-8 hover:bg-white/[0.08] transition-all cursor-pointer group flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-purple-400 text-2xl">router</span>
                  </div>
                  <div className="flex text-yellow-500">
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span className="material-symbols-outlined text-sm">star</span>
                  </div>
                </div>
                <h4 className="font-h3 text-lg text-white mb-2 font-bold">NetGuard Mesh WiFi</h4>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded border border-green-500/20 font-bold uppercase">No Hidden Backdoors</span>
                </div>
                <div className="bg-black/40 rounded-xl p-4 mt-auto border border-white/5 relative">
                  <span className="material-symbols-outlined absolute -top-3 -left-2 text-slate-600 text-3xl opacity-50">format_quote</span>
                  <p className="font-body-sm text-slate-300 italic text-sm relative z-10">"Thoroughly audited the firmware. It's completely open-source and respects user privacy without sending traffic data to third-party servers."</p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">SA</div>
                    <span className="text-[10px] text-slate-400">Security Analyst</span>
                  </div>
                </div>
              </div>

              {/* Product 3 */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-8 hover:bg-white/[0.08] transition-all cursor-pointer group flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-orange-400 text-2xl">account_balance_wallet</span>
                  </div>
                  <div className="flex text-yellow-500">
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span className="material-symbols-outlined text-sm">star</span>
                  </div>
                </div>
                <h4 className="font-h3 text-lg text-white mb-2 font-bold">Aegis Crypto Wallet</h4>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded border border-green-500/20 font-bold uppercase">Audited Smart Contracts</span>
                </div>
                <div className="bg-black/40 rounded-xl p-4 mt-auto border border-white/5 relative">
                  <span className="material-symbols-outlined absolute -top-3 -left-2 text-slate-600 text-3xl opacity-50">format_quote</span>
                  <p className="font-body-sm text-slate-300 italic text-sm relative z-10">"100% clean record. Multi-sig architecture is flawless, and the community audits show no vulnerabilities or malicious intents."</p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">MK</div>
                    <span className="text-[10px] text-slate-400">DeFi Enthusiast</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col md:flex-row justify-between items-center px-8 py-8 mt-auto bg-black/40 border-t border-white/5 z-10 relative">
        <div className="font-inter text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600 mb-4 md:mb-0">
            © 2024 SentinelReview AI • Digital Watchtower Security
        </div>
        <div className="flex gap-10">
          <a className="font-inter text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors" href="#">Privacy Protocol</a>
          <a className="font-inter text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors" href="#">Terms of Intelligence</a>
          <a className="font-inter text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors" href="#">XAI Whitepaper</a>
        </div>
      </footer>
    </>
  );
}
