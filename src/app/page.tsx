export default function Home() {
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
          {/* Live Pulse - Global Ticker */}
          <div className="glass-panel col-span-12 md:col-span-8 rounded-2xl p-8 flex flex-col overflow-hidden relative">
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">sensors</span>
                </div>
                <h2 className="font-h2 text-xl font-bold text-white uppercase tracking-wider">Live Pulse</h2>
              </div>
              <div className="flex gap-3">
                <span className="px-4 py-1.5 bg-error/10 text-error border border-error/20 font-bold text-[9px] tracking-[0.15em] rounded-full uppercase">3,241 THREATS DETECTED TODAY</span>
              </div>
            </div>
            <div className="flex-1 min-h-[380px] rounded-xl overflow-hidden relative group">
              {/* Map Background with custom glow points */}
              <div className="absolute inset-0 bg-slate-950/40 z-0"></div>
              <img alt="World Map" className="absolute inset-0 w-full h-full object-cover opacity-20 contrast-125 grayscale hover:grayscale-0 transition-all duration-1000 z-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2t1Ccb-Oa3LB0AmH7JJKn3fJS9V5ZX8ON1y3HI22k5U_xG_XWL0EjOaD6-Gph2vgbaYWgM_ddsMPfqUfaQATRV5kA0GwRMWu-WJQjFgK08evOXA2lzgCxTKPX_UjxkQuu8CT0lW4qWY7cxMAwEr5BxFETkKUz0q6sINia9slEt0mgt2oP53aHXuXKVQwPVZbALUL9glh2ozLvrMjfaFGiaoxUA3Ted2psfBxX1L95npJTaM21HdjmuGobdYauj5nwaSYiNo-zx5S3"/>
              
              {/* Decorative scanner lines */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                <div className="absolute w-full h-[1px] bg-primary/20 top-1/4 animate-[scan_8s_ease-in-out_infinite]"></div>
                <div className="absolute w-full h-[1px] bg-primary/20 top-3/4 animate-[scan_12s_ease-in-out_infinite]"></div>
              </div>
              
              {/* Floating Data Points Overlay */}
              <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl z-20">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                  <span className="font-label-caps text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">REAL-TIME FEED</span>
                  <span className="font-data-mono text-[10px] text-primary/60">LATENCY: 42ms</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between group/item">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-error shadow-[0_0_8px_rgba(255,180,171,0.5)]"></div>
                      <span className="font-data-mono text-sm text-slate-200">Bot-Farm Signal: campaign_id_882</span>
                    </div>
                    <span className="font-data-mono text-[10px] text-slate-500 uppercase">Singapore • Now</span>
                  </li>
                  <li className="flex items-center justify-between group/item">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
                      <span className="font-data-mono text-sm text-slate-200">High-Velocity URL Creation</span>
                    </div>
                    <span className="font-data-mono text-[10px] text-slate-500 uppercase">London • 2m ago</span>
                  </li>
                  <li className="flex items-center justify-between group/item">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                      <span className="font-data-mono text-sm text-slate-200">Coordinated Review Pattern</span>
                    </div>
                    <span className="font-data-mono text-[10px] text-slate-500 uppercase">Los Angeles • 5m ago</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="glass-panel col-span-12 md:col-span-4 rounded-2xl p-8 flex flex-col">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">security</span>
              </div>
              <h3 className="font-h3 text-xl font-bold text-white uppercase tracking-wider">Threat Topology</h3>
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="font-label-caps text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">MALICIOUS CONTENT</span>
                  <span className="font-data-mono text-sm text-white">42%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-error w-[42%] shadow-[0_0_10px_rgba(255,180,171,0.3)]"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="font-label-caps text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">BOT COORDINATION</span>
                  <span className="font-data-mono text-sm text-white">28%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[28%] shadow-[0_0_10px_rgba(185,199,228,0.3)]"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="font-label-caps text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">FINANCIAL FRAUD</span>
                  <span className="font-data-mono text-sm text-white">19%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-600 w-[19%] shadow-[0_0_10px_rgba(202,138,4,0.3)]"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="font-label-caps text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">OTHER SIGNALS</span>
                  <span className="font-data-mono text-sm text-white">11%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600 w-[11%]"></div>
                </div>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/5">
              <button className="w-full bg-white/5 border border-white/10 py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer">VIEW FULL TOPOLOGY</button>
            </div>
          </div>

          {/* Documentation Grid */}
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-8 hover:bg-white/[0.08] transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary">description</span>
              </div>
              <h4 className="font-h3 text-lg text-white mb-3 font-bold">Deep Intelligence Reports</h4>
              <p className="font-body-sm text-slate-400 mb-6 leading-relaxed">Read our latest whitepaper on cross-platform coordinated behavior.</p>
              <a className="text-primary font-bold uppercase tracking-widest text-[10px] inline-flex items-center gap-2 group-hover:gap-4 transition-all" href="#">LEARN MORE <span className="material-symbols-outlined text-sm">arrow_forward</span></a>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-8 hover:bg-white/[0.08] transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary">api</span>
              </div>
              <h4 className="font-h3 text-lg text-white mb-3 font-bold">Sentinel API v4.2</h4>
              <p className="font-body-sm text-slate-400 mb-6 leading-relaxed">Integration docs for high-volume automated URL auditing.</p>
              <a className="text-primary font-bold uppercase tracking-widest text-[10px] inline-flex items-center gap-2 group-hover:gap-4 transition-all" href="#">DOCS HUB <span className="material-symbols-outlined text-sm">arrow_forward</span></a>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-8 hover:bg-white/[0.08] transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary">shield</span>
              </div>
              <h4 className="font-h3 text-lg text-white mb-3 font-bold">Zero-Trust Auditing</h4>
              <p className="font-body-sm text-slate-400 mb-6 leading-relaxed">Our methodology for ensuring neutrality in automated reviews.</p>
              <a className="text-primary font-bold uppercase tracking-widest text-[10px] inline-flex items-center gap-2 group-hover:gap-4 transition-all" href="#">THE PROTOCOL <span className="material-symbols-outlined text-sm">arrow_forward</span></a>
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
