'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeProduct, getNews } from '@/lib/api';
import type { NewsItem } from '@/lib/types';

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingStep, setLoadingStep] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const loadingSteps = [
    'Scraping product reviews...',
    'Running NLP analysis...',
    'Detecting fake patterns...',
    'Clustering reviewers...',
    'Computing trust scores...',
    'Generating report...',
  ];

  useEffect(() => {
    getNews().then(setNews).catch(() => setNews([]));
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(s => (s + 1) % loadingSteps.length);
      }, 900);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setError('');
    setLoading(true);
    try {
      const data = await analyzeProduct(q);
      sessionStorage.setItem('analysisResult', JSON.stringify(data));
      sessionStorage.setItem('analysisQuery', q);
      router.push(`/analysis?url=${encodeURIComponent(q)}`);
    } catch {
      setError('Analysis failed. Ensure the backend is running on port 5000.');
      setLoading(false);
    }
  };

  const impactColors: Record<string, string> = {
    critical: 'text-error border-error/30 bg-error/10',
    high: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    medium: 'text-primary border-primary/30 bg-primary/10',
    low: 'text-slate-400 border-white/10 bg-white/5',
  };

  return (
    <>
      <main className="flex-1 p-8 overflow-x-hidden">
        {/* Hero Search Section */}
        <section className="h-[520px] flex flex-col items-center justify-center relative overflow-hidden rounded-2xl mb-8 group">
          {/* Background */}
          <div className="absolute inset-0 bg-[#050507]">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] opacity-50" />
            <img
              alt="Abstract data grid"
              className="w-full h-full object-cover mix-blend-overlay opacity-30 transition-transform duration-[20s] group-hover:scale-110"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-PwMvLJ4mt0bcHg32lB3cHsXjwXvlhnfDDMizj5dNEUU2FKINkIlHSf2x5iXTiDumZ6zBbA1fx1-bKZe0ivbG2hDKNkjaHiNMBzw9Dqgx5-txgpBxrcnRWc9i31ecypBILW2Ker8C-mye7cYQnulQGnJUn6V3GVbxDyh5d25ckwMkf6JonzY_ekR22sUWzIFOZGKbAb3iezb6HLn6UMSrp7fSOACGvC63nWaPsv3UPzWegMX0mAnYQ-j4UNpXOwGBSeAYbxO25Eby"
            />
          </div>

          <div className="relative z-10 w-full max-w-4xl px-8 text-center">
            <h1 className="font-h1 text-[56px] leading-[1] font-bold text-white mb-6 tracking-[-0.05em]">
              Vigilance Starts <span className="text-primary italic">with</span> Clarity
            </h1>
            <p className="font-body-lg text-lg text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Paste any product URL or name. Our AI engine analyzes reviews using NLP, behavioral signals, and DBSCAN clustering to surface fake, coordinated, or manipulated content.
            </p>

            {/* Search / Analyze Form */}
            <form onSubmit={handleSubmit} className="glow-border relative max-w-2xl mx-auto flex items-center bg-slate-900/60 backdrop-blur-md border border-white/10 p-2 rounded-2xl transition-all shadow-2xl">
              <span className="material-symbols-outlined text-slate-500 ml-5">search</span>
              <input
                ref={inputRef}
                name="url"
                value={query}
                onChange={e => setQuery(e.target.value)}
                disabled={loading}
                className="flex-1 bg-transparent border-none text-white font-body-lg focus:ring-0 px-5 py-4 placeholder:text-slate-600 text-lg outline-none disabled:opacity-50"
                placeholder="Paste product URL or name (e.g. Sony WH-1000XM5, boAt Airdopes)..."
                type="text"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-primary hover:bg-primary-fixed text-on-primary px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-[12px] transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Analyzing
                  </>
                ) : 'Audit'}
              </button>
            </form>

            {/* Loading step indicator */}
            {loading && (
              <div className="mt-5 font-data-mono text-[11px] text-primary/60 animate-pulse tracking-widest uppercase">
                {loadingSteps[loadingStep]}
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="mt-4 text-error text-sm font-data-mono">{error}</p>
            )}

            {/* Sub-labels */}
            <div className="mt-10 flex justify-center gap-10">
              {['NLP + BERT Embeddings', 'DBSCAN Clustering', 'Behavioral Analysis'].map(label => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  <span className="font-label-caps text-[9px] uppercase tracking-[0.2em] text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Grid — Stats / Live Feed */}
        <div className="bento-grid mb-8">
          {/* Live Pulse */}
          <div className="glass-panel col-span-12 md:col-span-8 rounded-2xl p-8 flex flex-col overflow-hidden relative">
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">sensors</span>
                </div>
                <h2 className="font-h2 text-xl font-bold text-white uppercase tracking-wider">Live Pulse</h2>
              </div>
              <span className="px-4 py-1.5 bg-error/10 text-error border border-error/20 font-bold text-[9px] tracking-[0.15em] rounded-full uppercase">
                3,241 THREATS DETECTED TODAY
              </span>
            </div>
            <div className="flex-1 min-h-[280px] rounded-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-slate-950/40 z-0" />
              <img
                alt="World Map"
                className="absolute inset-0 w-full h-full object-cover opacity-20 contrast-125 grayscale hover:grayscale-0 transition-all duration-1000 z-0"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2t1Ccb-Oa3LB0AmH7JJKn3fJS9V5ZX8ON1y3HI22k5U_xG_XWL0EjOaD6-Gph2vgbaYWgM_ddsMPfqUfaQATRV5kA0GwRMWu-WJQjFgK08evOXA2lzgCxTKPX_UjxkQuu8CT0lW4qWY7cxMAwEr5BxFETkKUz0q6sINia9slEt0mgt2oP53aHXuXKVQwPVZbALUL9glh2ozLvrMjfaFGiaoxUA3Ted2psfBxX1L95npJTaM21HdjmuGobdYauj5nwaSYiNo-zx5S3"
              />
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                <div className="absolute w-full h-[1px] bg-primary/20 top-1/4 animate-[scan_8s_ease-in-out_infinite]" />
                <div className="absolute w-full h-[1px] bg-primary/20 top-3/4 animate-[scan_12s_ease-in-out_infinite]" />
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl z-20">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                  <span className="font-label-caps text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">REAL-TIME FEED</span>
                  <span className="font-data-mono text-[10px] text-primary/60">LATENCY: 42ms</span>
                </div>
                <ul className="space-y-3">
                  {[
                    { color: 'bg-error', label: 'Bot-Farm Signal: campaign_id_882', loc: 'Singapore • Now' },
                    { color: 'bg-yellow-500', label: 'High-Velocity Review Creation', loc: 'Mumbai • 2m ago' },
                    { color: 'bg-blue-500', label: 'Coordinated Review Pattern', loc: 'Los Angeles • 5m ago' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                        <span className="font-data-mono text-sm text-slate-200">{item.label}</span>
                      </div>
                      <span className="font-data-mono text-[10px] text-slate-500 uppercase">{item.loc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Threat Topology */}
          <div className="glass-panel col-span-12 md:col-span-4 rounded-2xl p-8 flex flex-col">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">security</span>
              </div>
              <h3 className="font-h3 text-xl font-bold text-white uppercase tracking-wider">Threat Topology</h3>
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-8">
              {[
                { label: 'FAKE POSITIVE REVIEWS', pct: 42, color: 'bg-error', glow: 'rgba(255,180,171,0.3)' },
                { label: 'BOT COORDINATION', pct: 28, color: 'bg-primary', glow: 'rgba(185,199,228,0.3)' },
                { label: 'COMPETITOR ATTACKS', pct: 19, color: 'bg-yellow-600', glow: 'rgba(202,138,4,0.3)' },
                { label: 'OTHER SIGNALS', pct: 11, color: 'bg-slate-600', glow: 'none' },
              ].map(item => (
                <div key={item.label} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="font-label-caps text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">{item.label}</span>
                    <span className="font-data-mono text-sm text-white">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 pt-8 border-t border-white/5">
              <button
                onClick={() => inputRef.current?.focus()}
                className="w-full bg-white/5 border border-white/10 py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                ANALYZE A PRODUCT
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
            {[
              { icon: 'description', title: 'Deep Intelligence Reports', desc: 'Read our latest whitepaper on cross-platform coordinated fake review campaigns.', cta: 'LEARN MORE' },
              { icon: 'api', title: 'Sentinel API v2.0', desc: 'Integration docs for automated product review auditing via our FastAPI backend.', cta: 'DOCS HUB' },
              { icon: 'shield', title: 'Zero-Trust Auditing', desc: 'Our AI methodology for neutral, explainable fake review detection.', cta: 'THE PROTOCOL' },
            ].map((card) => (
              <div key={card.title} className="bg-white/5 border border-white/5 rounded-2xl p-8 hover:bg-white/[0.08] transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary">{card.icon}</span>
                </div>
                <h4 className="font-h3 text-lg text-white mb-3 font-bold">{card.title}</h4>
                <p className="font-body-sm text-slate-400 mb-6 leading-relaxed">{card.desc}</p>
                <a className="text-primary font-bold uppercase tracking-widest text-[10px] inline-flex items-center gap-2 group-hover:gap-4 transition-all" href="#">
                  {card.cta} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ── Fake Review News Section ───────────────────────────────────────── */}
        <section className="mt-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-xl">newspaper</span>
            </div>
            <div>
              <h2 className="font-h2 text-xl font-bold text-white uppercase tracking-wider">Fake Review Intelligence Feed</h2>
              <p className="text-slate-500 text-[11px] uppercase tracking-widest mt-1">Latest coordinated manipulation campaigns & platform actions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {news.length === 0 ? (
              // Skeleton placeholders while loading
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-panel rounded-2xl p-6 animate-pulse">
                  <div className="h-3 bg-white/10 rounded mb-4 w-1/3" />
                  <div className="h-5 bg-white/10 rounded mb-3" />
                  <div className="h-3 bg-white/5 rounded mb-2" />
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                </div>
              ))
            ) : (
              news.map((item, idx) => (
                <article
                  key={item.id}
                  className="glass-panel rounded-2xl p-6 hover:bg-white/[0.06] transition-all cursor-default group"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`font-label-caps text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full border ${impactColors[item.impact] || impactColors.low}`}>
                      {item.category}
                    </span>
                    <span className="font-data-mono text-[10px] text-slate-600">{item.date}</span>
                  </div>
                  <h3 className="text-white font-bold text-[15px] leading-snug mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-slate-400 text-[13px] leading-relaxed mb-4 line-clamp-3">{item.summary}</p>
                  <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    <span className="material-symbols-outlined text-slate-600 text-sm">article</span>
                    <span className="font-data-mono text-[11px] text-slate-600">{item.source}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col md:flex-row justify-between items-center px-8 py-8 mt-auto bg-black/40 border-t border-white/5 z-10 relative">
        <div className="font-inter text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600 mb-4 md:mb-0">
          © 2025 ReviewGuard AI • Odyssey CodeX Hackathon
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
