import { falseNegativePool, falsePositivePool, cleanReviewPool, getRandomItems } from "@/lib/mockData";
import AutoScrollFeed from "@/components/AutoScrollFeed";

export const dynamic = "force-dynamic";

export default function Home() {
  const falseNegatives = getRandomItems(falseNegativePool, 4);
  const falsePositives = getRandomItems(falsePositivePool, 4);
  const cleanReviews = getRandomItems(cleanReviewPool, 3);

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
            
            <div className="flex-1 min-h-[380px] relative overflow-hidden rounded-xl border border-white/5 bg-black/40">
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#050507] to-transparent z-10 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#050507] to-transparent z-10 pointer-events-none"></div>
              <AutoScrollFeed items={falseNegatives} feedType="negative" />
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
            
            <div className="flex-1 min-h-[380px] relative overflow-hidden rounded-xl border border-white/5 bg-black/40">
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#050507] to-transparent z-10 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#050507] to-transparent z-10 pointer-events-none"></div>
              <AutoScrollFeed items={falsePositives} feedType="positive" />
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
              {cleanReviews.map((review, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-8 hover:bg-white/[0.08] transition-all cursor-pointer group flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl ${review.iconBgClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <span className={`material-symbols-outlined ${review.iconTextClass} text-2xl`}>{review.icon}</span>
                    </div>
                    <div className="flex text-yellow-500">
                      <span className="material-symbols-outlined text-sm">star</span>
                      <span className="material-symbols-outlined text-sm">star</span>
                      <span className="material-symbols-outlined text-sm">star</span>
                      <span className="material-symbols-outlined text-sm">star</span>
                      <span className="material-symbols-outlined text-sm">star</span>
                    </div>
                  </div>
                  <h4 className="font-h3 text-lg text-white mb-2 font-bold">{review.title}</h4>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded border border-green-500/20 font-bold uppercase">100% Verified Clean</span>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 mt-auto border border-white/5 relative">
                    <span className="material-symbols-outlined absolute -top-3 -left-2 text-slate-600 text-3xl opacity-50">format_quote</span>
                    <p className="font-body-sm text-slate-300 italic text-sm relative z-10">{review.review}</p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">{review.initials}</div>
                      <span className="text-[10px] text-slate-400">{review.author}</span>
                    </div>
                  </div>
                </div>
              ))}
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
