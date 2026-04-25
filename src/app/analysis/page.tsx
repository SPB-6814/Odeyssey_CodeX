'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ScatterChart, Scatter, Cell, ZAxis,
} from 'recharts';
import type { AnalysisResult, Review, CommonIssue, FakePattern, ClusterPoint, TimelinePoint } from '@/lib/types';

// ─── Tooltip ───────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-950/95 border border-white/10 rounded-xl px-4 py-3 text-xs shadow-2xl">
      {label && <p className="text-white font-bold mb-2">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  );
}

// ─── Star Renderer ─────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(Math.max(0, 5 - Math.floor(rating)))}
    </span>
  );
}

// ─── Review Card ───────────────────────────────────────────────────────────
function ReviewCard({ review, type }: { review: Review; type: 'genuine' | 'fake' }) {
  const isGenuine = type === 'genuine';
  return (
    <div className={`rounded-xl p-4 border transition-all mb-3 ${isGenuine ? 'bg-green-900/10 border-green-500/20 hover:border-green-500/40' : 'bg-red-900/10 border-red-500/20 hover:border-red-500/40'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm">{review.reviewer_name}</span>
          {review.verified && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 border border-green-500/30 font-bold">✓ VERIFIED</span>
          )}
          {!review.verified && type === 'fake' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-500/30 font-bold">✗ UNVERIFIED</span>
          )}
        </div>
        <Stars rating={review.rating} />
      </div>
      <p className="text-slate-400 text-[13px] leading-relaxed line-clamp-3 mb-2">{review.text}</p>
      <div className="flex items-center justify-between">
        <span className="font-data-mono text-[10px] text-slate-600">
          {review.date ? new Date(review.date).toLocaleDateString('en-IN') : '—'}
        </span>
        <span className={`font-data-mono text-[11px] px-2 py-0.5 rounded-md font-bold ${review.trust_score >= 50 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
          TRUST {review.trust_score}%
        </span>
      </div>
      {review.flag_reasons?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
          {review.flag_reasons.map((r, i) => (
            <p key={i} className="text-[11px] text-red-400 flex items-start gap-1.5">
              <span className="material-symbols-outlined text-[13px] mt-0.5 flex-shrink-0">warning</span> {r}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────
export default function AnalysisPage() {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem('analysisResult');
    const q = sessionStorage.getItem('analysisQuery');
    if (!stored) { router.push('/'); return; }
    setData(JSON.parse(stored));
    setQuery(q || '');
  }, [router]);

  if (!data) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin w-12 h-12 text-primary mx-auto mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-slate-400 font-data-mono uppercase tracking-widest text-sm">Loading analysis...</p>
        </div>
      </main>
    );
  }

  const { product, ratings, reviews, timeline, clusters, common_issues, fake_patterns } = data;
  const ratingDiff = (ratings.adjusted - ratings.original).toFixed(1);

  const severityStyle: Record<string, string> = {
    high: 'text-red-400 bg-red-900/20 border-red-500/30',
    medium: 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30',
    low: 'text-slate-400 bg-white/5 border-white/10',
  };

  const patternBorder: Record<string, string> = {
    high: 'border-l-red-500 bg-red-900/10',
    medium: 'border-l-yellow-500 bg-yellow-900/10',
    low: 'border-l-slate-600 bg-white/5',
  };

  return (
    <main className="flex-1 p-8 overflow-x-hidden">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-slate-400 hover:text-white hover:border-primary/40 transition-all text-sm"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span> Back
          </button>
          <div>
            <h1 className="font-h1 text-2xl font-bold text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">shield_check</span>
              Analysis Report
            </h1>
            <p className="font-data-mono text-[11px] text-slate-500 mt-1 uppercase tracking-widest">Target: {query}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border font-label-caps text-[10px] ${ratings.confidence >= 0.8 ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400'}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {Math.round(ratings.confidence * 100)}% CONFIDENCE
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-slate-400 font-label-caps text-[10px]">
            <span className="material-symbols-outlined text-primary text-sm">schedule</span>
            {data.meta?.analysis_timestamp?.split('T')[0] || 'Just now'}
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {/* ── Section 1 & 2 & 3: Product Info + Ratings ──────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Product Info */}
          <div className="glass-panel rounded-2xl p-6 col-span-12 md:col-span-7 flex gap-5 items-start">
            <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-3xl">inventory_2</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-xl leading-tight mb-1 truncate">{product.name}</h2>
              <p className="text-slate-400 text-sm mb-3">{product.category}</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: 'storefront', label: product.platform },
                  { icon: 'sell', label: product.price },
                  { icon: 'reviews', label: `${ratings.total_reviews} reviews` },
                  { icon: product.source === 'demo' ? 'science' : 'public', label: product.source === 'demo' ? 'Demo Data' : 'Live Data' },
                ].map(m => (
                  <span key={m.label} className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <span className="material-symbols-outlined text-primary/60 text-sm">{m.icon}</span> {m.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Ratings Comparison */}
          <div className="glass-panel rounded-2xl p-6 col-span-12 md:col-span-5 flex items-center justify-around">
            <div className="text-center">
              <p className="font-label-caps text-[9px] text-slate-500 mb-2 tracking-widest">ORIGINAL RATING</p>
              <p className="text-5xl font-black text-slate-400 leading-none">{ratings.original}</p>
              <Stars rating={ratings.original} />
            </div>
            <div className="h-16 w-px bg-white/10" />
            <div className="text-center">
              <p className="font-label-caps text-[9px] text-slate-500 mb-2 tracking-widest">ADJUSTED RATING</p>
              <p className="text-5xl font-black text-primary leading-none">{ratings.adjusted}</p>
              <Stars rating={ratings.adjusted} />
              <p className={`text-xs font-bold mt-1 flex items-center justify-center gap-1 ${parseFloat(ratingDiff) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {parseFloat(ratingDiff) < 0 ? '↓' : '↑'} {Math.abs(parseFloat(ratingDiff))} adj.
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats Row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: 'reviews', label: 'Total Reviews', value: ratings.total_reviews, color: 'text-white' },
            { icon: 'verified', label: 'Genuine', value: ratings.genuine_count, color: 'text-green-400' },
            { icon: 'flag', label: 'Fake / Suspicious', value: ratings.fake_count, color: 'text-red-400' },
            { icon: 'percent', label: 'Fake Rate', value: `${ratings.total_reviews > 0 ? Math.round((ratings.fake_count / ratings.total_reviews) * 100) : 0}%`, color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="glass-panel rounded-2xl p-5 text-center">
              <span className={`material-symbols-outlined text-2xl mb-2 ${s.color}`}>{s.icon}</span>
              <p className={`text-3xl font-black leading-none mb-1 ${s.color}`}>{s.value}</p>
              <p className="font-label-caps text-[9px] text-slate-500 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Section 4: Genuine vs Fake Reviews ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Genuine */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-green-500/20">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-green-400 text-xl">verified</span>
                Genuine Reviews
              </h3>
              <span className="font-data-mono text-[11px] px-3 py-1 rounded-full bg-green-900/30 text-green-400 border border-green-500/30 font-bold">{reviews.genuine.length}</span>
            </div>
            <div className="p-4 max-h-[520px] overflow-y-auto space-y-1 custom-scroll">
              {reviews.genuine.slice(0, 15).map((r, i) => <ReviewCard key={r.id || i} review={r} type="genuine" />)}
            </div>
          </div>

          {/* Fake */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-500/20">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400 text-xl">flag</span>
                Fake / Suspicious Reviews
              </h3>
              <span className="font-data-mono text-[11px] px-3 py-1 rounded-full bg-red-900/30 text-red-400 border border-red-500/30 font-bold">{reviews.fake.length}</span>
            </div>
            <div className="p-4 max-h-[520px] overflow-y-auto space-y-1 custom-scroll">
              {reviews.fake.slice(0, 15).map((r, i) => <ReviewCard key={r.id || i} review={r} type="fake" />)}
            </div>
          </div>
        </div>

        {/* ── Section 5 & 6: Timeline + Reviewer Clusters ────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Timeline Chart */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-1">
              <span className="material-symbols-outlined text-primary text-xl">timeline</span>
              <h3 className="font-bold text-white text-lg">Review Timeline</h3>
            </div>
            <p className="font-data-mono text-[10px] text-slate-600 uppercase tracking-widest mb-6">
              Weekly volume — spikes indicate manipulation bursts
            </p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline as TimelinePoint[]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" stroke="#44474d" fontSize={10} tickFormatter={v => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}`; }} />
                  <YAxis stroke="#44474d" fontSize={10} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="total" stroke="#b9c7e4" strokeWidth={2} dot={false} name="Total" />
                  <Line type="monotone" dataKey="genuine" stroke="#38a169" strokeWidth={2} dot={false} name="Genuine" />
                  <Line type="monotone" dataKey="fake" stroke="#e53e3e" strokeWidth={2} dot={false} name="Fake" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reviewer Cluster Chart */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-1">
              <span className="material-symbols-outlined text-primary text-xl">hub</span>
              <h3 className="font-bold text-white text-lg">Reviewer Clusters</h3>
            </div>
            <p className="font-data-mono text-[10px] text-slate-600 uppercase tracking-widest mb-6">
              DBSCAN — red dots indicate coordinated suspicious activity
            </p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis type="number" dataKey="x" stroke="#44474d" fontSize={10} name="Account Feature" />
                  <YAxis type="number" dataKey="y" stroke="#44474d" fontSize={10} name="Sentiment" />
                  <ZAxis type="number" dataKey="size" range={[30, 220]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as ClusterPoint;
                      return (
                        <div className="bg-slate-950/95 border border-white/10 rounded-xl px-4 py-3 text-xs shadow-2xl">
                          <p className="text-white font-bold">{d.name}</p>
                          <p className={d.suspicious ? 'text-red-400' : 'text-green-400'}>{d.suspicious ? '🚩 Suspicious' : '✅ Genuine'}</p>
                          <p className="text-slate-400">Trust: {d.trust_score}% | Cluster: {d.cluster === -1 ? 'None' : d.cluster}</p>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={clusters as ClusterPoint[]} name="Reviewers">
                    {(clusters as ClusterPoint[]).map((entry, idx) => (
                      <Cell key={idx} fill={entry.suspicious ? '#e53e3e' : '#38a169'} fillOpacity={0.7} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 mt-4 justify-center">
              <div className="flex items-center gap-2 text-xs text-slate-400"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Genuine reviewers</div>
              <div className="flex items-center gap-2 text-xs text-slate-400"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Suspicious / bot-like</div>
            </div>
          </div>
        </div>

        {/* ── Section 7: Common Issues + Fake Patterns ───────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Common Issues */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-yellow-400 text-xl">search_insights</span>
              <div>
                <h3 className="font-bold text-white text-lg">Common Issues</h3>
                <p className="font-data-mono text-[10px] text-slate-600 uppercase tracking-widest">Extracted from genuine negative reviews via TF-IDF</p>
              </div>
            </div>
            {common_issues.length === 0 ? (
              <p className="text-slate-500 text-sm font-data-mono">No common issues found in genuine reviews.</p>
            ) : (
              <div className="space-y-3">
                {(common_issues as CommonIssue[]).map((issue, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${issue.severity === 'high' ? 'bg-red-400' : issue.severity === 'medium' ? 'bg-yellow-400' : 'bg-slate-400'}`} />
                      <span className="text-white text-sm font-medium">{issue.issue}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`font-label-caps text-[9px] px-2 py-1 rounded-full border ${severityStyle[issue.severity]}`}>{issue.severity.toUpperCase()}</span>
                      <span className="font-data-mono text-[11px] text-slate-500">{issue.count}×</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fake Patterns */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-error text-xl">warning</span>
              <div>
                <h3 className="font-bold text-white text-lg">Manipulation Patterns</h3>
                <p className="font-data-mono text-[10px] text-slate-600 uppercase tracking-widest">Coordinated attack signals detected</p>
              </div>
            </div>
            {fake_patterns.length === 0 ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-900/10 border border-green-500/20">
                <span className="material-symbols-outlined text-green-400">verified_user</span>
                <p className="text-green-400 text-sm font-medium">No manipulation patterns detected. Reviews appear organic.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(fake_patterns as FakePattern[]).map((p, i) => (
                  <div key={i} className={`border-l-4 rounded-r-xl p-4 ${patternBorder[p.severity]}`}>
                    <p className="font-bold text-white text-sm mb-1">{p.pattern}</p>
                    <p className="text-slate-400 text-[13px] leading-relaxed">{p.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Confidence breakdown */}
            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="font-label-caps text-[9px] text-slate-500 mb-3 uppercase tracking-widest">Analysis Confidence</p>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${Math.round(ratings.confidence * 100)}%` }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="font-data-mono text-[10px] text-slate-600">0%</span>
                <span className="font-data-mono text-[10px] text-primary">{Math.round(ratings.confidence * 100)}% confidence</span>
                <span className="font-data-mono text-[10px] text-slate-600">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center">
        <span className="font-data-mono text-[10px] text-slate-700 uppercase tracking-widest">© 2025 ReviewGuard AI • Odyssey CodeX</span>
        <button onClick={() => router.push('/')} className="font-label-caps text-[10px] text-primary hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">arrow_back</span> New Analysis
        </button>
      </footer>
    </main>
  );
}
