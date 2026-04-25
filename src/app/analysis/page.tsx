"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BentoBox } from "@/components/ui/BentoBox";
import AutoScrollFeed from "@/components/AutoScrollFeed";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  Star, Users, TrendingUp, AlertTriangle, Package, Award,
  Scale, Link as LinkIcon, Loader2, WifiOff,
} from "lucide-react";
import {
  analyzeProduct,
  toTimelineChartData,
  toClusterBarChartData,
  type AnalysisResult,
} from "@/lib/api";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement
);

// ─── Chart options ────────────────────────────────────────────────────────────

const chartScales = {
  y: { grid: { color: "#374151" }, ticks: { color: "#9ca3af" } },
  x: { grid: { color: "#374151" }, ticks: { color: "#9ca3af" } },
};

const timelineOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { ...chartScales, y: { ...chartScales.y, beginAtZero: false, min: 1, max: 5 } },
};

const clusterOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    ...chartScales,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y: { ...chartScales.y, beginAtZero: true, ticks: { ...chartScales.y.ticks, callback: (v: any) => v + "%" } },
  },
};

// ─── Star renderer ────────────────────────────────────────────────────────────

function StarRating({ rating, color = "yellow" }: { rating: number; color?: string }) {
  const full = Math.floor(rating);
  const cls = color === "green" ? "text-green-400 fill-green-400" : "text-yellow-400 fill-yellow-400";
  const empty = color === "green" ? "text-green-400" : "text-yellow-400";
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-6 h-6 ${s <= full ? cls : empty}`} />
      ))}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-xl font-bold text-on-surface">Analysing Reviews…</p>
        <p className="text-sm text-on-surface-variant font-data-mono max-w-xl truncate">{url}</p>
        <div className="flex gap-3 justify-center mt-4 text-xs text-on-surface-variant/60">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary animate-pulse" />Scraping</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary animate-pulse delay-150" />Classifying</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-300" />Aggregating</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full max-w-5xl animate-pulse mt-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`bento-glass rounded-2xl p-6 h-36 ${i < 3 ? "md:col-span-4" : "md:col-span-6"}`}>
            <div className="h-3 bg-white/10 rounded w-1/2 mb-4" />
            <div className="h-6 bg-white/5 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message, url }: { message: string; url: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <WifiOff className="w-8 h-8 text-red-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-on-surface mb-2">Analysis Failed</h2>
        <p className="text-sm text-on-surface-variant max-w-md">{message}</p>
        <p className="text-xs text-on-surface-variant/50 mt-2 font-data-mono break-all max-w-lg">{url}</p>
      </div>
      <a href="/" className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all">
        Try Again
      </a>
    </div>
  );
}

// ─── Severity badge helper ────────────────────────────────────────────────────

function severityClass(s: string, type: "border" | "badge") {
  if (type === "border") return s === "high" ? "border-red-500/30 bg-red-500/5" : s === "medium" ? "border-yellow-500/30 bg-yellow-500/5" : "border-blue-500/30 bg-blue-500/5";
  return s === "high" ? "bg-red-500/20 text-red-400" : s === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400";
}

// ─── Review card ──────────────────────────────────────────────────────────────

function ReviewCard({ reviewer, rating, text, date, flagReason }: { reviewer: string; rating: number; text: string; date: string; flagReason?: string }) {
  const isFake = !!flagReason;
  return (
    <div className={`rounded-lg p-4 border ${isFake ? "bg-red-500/5 border-red-500/20" : "bg-green-500/5 border-green-500/20"}`}>
      <div className="flex items-start justify-between mb-1">
        <span className="font-bold text-on-surface text-sm">{reviewer}</span>
        <span className={`text-xs font-mono ${isFake ? "text-red-400" : "text-green-400"}`}>{rating}★ · {date}</span>
      </div>
      <p className="text-on-surface-variant text-sm">{text}</p>
      {isFake && (
        <span className="inline-block mt-2 px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] rounded border border-red-500/20 font-bold uppercase">
          ⚠ {flagReason}
        </span>
      )}
    </div>
  );
}

// ─── Dashboard (real data) ────────────────────────────────────────────────────

function Dashboard({ data, url }: { data: AnalysisResult; url: string }) {
  const { product_details, reviews_breakdown, timeline_graph_data, reviewer_cluster_data, common_issues } = data;

  const genuineCount = reviews_breakdown.genuine_reviews.length;
  const fakeCount = reviews_breakdown.fake_reviews.length;
  const total = genuineCount + fakeCount;
  const genuinePct = total > 0 ? ((genuineCount / total) * 100).toFixed(1) : "0";
  const fakePct = total > 0 ? ((fakeCount / total) * 100).toFixed(1) : "0";

  const timelineData = toTimelineChartData(timeline_graph_data);
  const clusterData = toClusterBarChartData(reviewer_cluster_data);

  // Feed items derived from real reviews
  const negativeItems = reviews_breakdown.fake_reviews.slice(0, 6).map(r => ({
    title: r.reviewer, status: "Flagged Fake", issue: r.flag_reason, time: r.date,
  }));
  const positiveItems = reviews_breakdown.genuine_reviews.slice(0, 6).map(r => ({
    title: r.reviewer, status: "Verified", resolution: `${r.rating}★ — Genuine`, time: r.date,
  }));

  const [compareMode, setCompareMode] = useState(false);
  const [url2, setUrl2] = useState("");
  const [data2, setData2] = useState<AnalysisResult | null>(null);
  const [loading2, setLoading2] = useState(false);

  const fetchCompare = async () => {
    if (!url2.trim()) return;
    setLoading2(true);
    try {
      const res = await analyzeProduct(url2.trim());
      setData2(res);
    } catch {
      setData2(null);
    } finally {
      setLoading2(false);
    }
  };

  return (
    <main className="min-h-screen p-[var(--spacing-margin)] max-w-[1600px] mx-auto w-full relative z-10">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 text-on-surface flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Product Review Analysis
          </h1>
          {!compareMode && <p className="text-sm text-on-surface-variant mt-1 font-data-mono truncate max-w-2xl">Target: {url}</p>}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${compareMode ? "bg-primary/20 text-primary border-primary" : "bg-surface-container text-on-surface border-outline-variant/30 hover:bg-white/5"}`}
          >
            <Scale className="w-4 h-4" />
            {compareMode ? "Exit Compare" : "Compare"}
          </button>
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-signal-green shadow-[0_0_8px_var(--color-signal-green)] animate-pulse" />
            <span className="text-label-caps text-on-surface">Live Analysis</span>
          </div>
        </div>
      </header>

      {compareMode ? (
        /* ── COMPARE MODE ── */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-primary" />
              </div>
              <input readOnly value={url} className="w-full bg-surface-container/80 border border-primary/30 text-on-surface rounded-xl pl-12 pr-4 py-4 font-data-mono" />
              <div className="absolute top-0 right-4 -translate-y-1/2 bg-surface px-2 text-xs font-bold text-primary tracking-wider uppercase">Product 1</div>
            </div>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-secondary" />
                </div>
                <input type="text" value={url2} onChange={e => setUrl2(e.target.value)} placeholder="Paste second product URL..." className="w-full bg-surface-container/80 border border-secondary/30 text-on-surface rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-secondary transition-all font-data-mono" />
                <div className="absolute top-0 right-4 -translate-y-1/2 bg-surface px-2 text-xs font-bold text-secondary tracking-wider uppercase">Product 2</div>
              </div>
              <button onClick={fetchCompare} disabled={loading2 || !url2.trim()} className="px-5 rounded-xl bg-secondary text-on-secondary font-bold text-sm disabled:opacity-40 transition-all hover:brightness-110">
                {loading2 ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyse"}
              </button>
            </div>
          </div>

          {/* Side-by-side metrics */}
          {[
            { label: "Product Name", v1: product_details.name, v2: data2?.product_details.name },
            { label: "Category", v1: product_details.category || "—", v2: data2?.product_details.category || "—" },
            { label: "Total Reviews", v1: product_details.total_reviews.toLocaleString(), v2: data2?.product_details.total_reviews.toLocaleString() },
          ].map(({ label, v1, v2 }) => (
            <div key={label}>
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3 border-b border-outline-variant/30 pb-2">{label}</h3>
              <div className="grid grid-cols-2 gap-8">
                <BentoBox delay={0.1} className="border-t-2 border-t-primary/50"><p className="text-body-lg text-on-surface">{v1}</p></BentoBox>
                <BentoBox delay={0.1} className={`border-t-2 border-t-secondary/50 ${!data2 ? "opacity-40" : ""}`}><p className="text-body-lg text-on-surface">{v2 ?? (loading2 ? "Loading…" : "Enter URL above")}</p></BentoBox>
              </div>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3 border-b border-outline-variant/30 pb-2">Original → Adjusted Rating</h3>
            <div className="grid grid-cols-2 gap-8">
              <BentoBox delay={0.2}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><span className="text-3xl font-bold text-on-surface">{product_details.original_rating.toFixed(1)}</span><StarRating rating={product_details.original_rating} /></div>
                  <div className="flex items-center gap-3"><span className="text-3xl font-bold text-green-400">{product_details.adjusted_rating.toFixed(1)}</span><StarRating rating={product_details.adjusted_rating} color="green" /></div>
                </div>
              </BentoBox>
              <BentoBox delay={0.2} className={!data2 ? "opacity-40" : ""}>
                {data2 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3"><span className="text-3xl font-bold text-on-surface">{data2.product_details.original_rating.toFixed(1)}</span><StarRating rating={data2.product_details.original_rating} /></div>
                    <div className="flex items-center gap-3"><span className="text-3xl font-bold text-green-400">{data2.product_details.adjusted_rating.toFixed(1)}</span><StarRating rating={data2.product_details.adjusted_rating} color="green" /></div>
                  </div>
                ) : <p className="text-on-surface-variant">—</p>}
              </BentoBox>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3 border-b border-outline-variant/30 pb-2">Genuine vs Fake Reviews</h3>
            <div className="grid grid-cols-2 gap-8">
              <BentoBox delay={0.3}>
                <div className="flex gap-6 text-center">
                  <div><p className="text-3xl font-bold text-green-500">{genuineCount}</p><p className="text-xs text-on-surface-variant mt-1">{genuinePct}% genuine</p></div>
                  <div><p className="text-3xl font-bold text-red-500">{fakeCount}</p><p className="text-xs text-on-surface-variant mt-1">{fakePct}% fake</p></div>
                </div>
              </BentoBox>
              <BentoBox delay={0.3} className={!data2 ? "opacity-40" : ""}>
                {data2 ? (() => {
                  const g2 = data2.reviews_breakdown.genuine_reviews.length;
                  const f2 = data2.reviews_breakdown.fake_reviews.length;
                  const t2 = g2 + f2;
                  return (
                    <div className="flex gap-6 text-center">
                      <div><p className="text-3xl font-bold text-green-500">{g2}</p><p className="text-xs text-on-surface-variant mt-1">{t2 > 0 ? ((g2 / t2) * 100).toFixed(1) : 0}% genuine</p></div>
                      <div><p className="text-3xl font-bold text-red-500">{f2}</p><p className="text-xs text-on-surface-variant mt-1">{t2 > 0 ? ((f2 / t2) * 100).toFixed(1) : 0}% fake</p></div>
                    </div>
                  );
                })() : <p className="text-on-surface-variant">—</p>}
              </BentoBox>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3 border-b border-outline-variant/30 pb-2">Rating Timeline</h3>
            <div className="grid grid-cols-2 gap-8">
              <BentoBox delay={0.4} className="h-[280px]">
                {timeline_graph_data.length > 0 ? <Line data={timelineData} options={timelineOptions} /> : <p className="text-on-surface-variant h-full flex items-center justify-center">No timeline data</p>}
              </BentoBox>
              <BentoBox delay={0.4} className={`h-[280px] ${!data2 ? "opacity-40" : ""}`}>
                {data2 && data2.timeline_graph_data.length > 0 ? <Line data={toTimelineChartData(data2.timeline_graph_data)} options={timelineOptions} /> : <p className="text-on-surface-variant h-full flex items-center justify-center">{data2 ? "No timeline data" : "—"}</p>}
              </BentoBox>
            </div>
          </div>
        </motion.div>
      ) : (
        /* ── STANDARD DASHBOARD ── */
        <>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-[var(--spacing-bento-gap)] auto-rows-min">

            {/* Product Info */}
            <BentoBox delay={0.1} className="md:col-span-4 lg:col-span-3">
              <h2 className="text-h3 text-on-surface mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-primary" />Product Info</h2>
              <div className="space-y-3">
                <div><p className="text-label-caps text-on-surface-variant">Product Name</p><p className="text-body-lg text-on-surface">{product_details.name}</p></div>
                {product_details.category && <div><p className="text-label-caps text-on-surface-variant">Category</p><p className="text-body-lg text-on-surface">{product_details.category}</p></div>}
                <div><p className="text-label-caps text-on-surface-variant">Total Reviews</p><p className="text-body-lg text-on-surface">{product_details.total_reviews.toLocaleString()}</p></div>
                <div><p className="text-label-caps text-on-surface-variant">Sample Analysed</p><p className="text-body-lg text-on-surface">{total} reviews</p></div>
              </div>
            </BentoBox>

            {/* Original Rating */}
            <BentoBox delay={0.2} className="md:col-span-4 lg:col-span-3">
              <h2 className="text-h3 text-on-surface mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500" />Original Rating</h2>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-on-surface">{product_details.original_rating.toFixed(1)}</div>
                <StarRating rating={product_details.original_rating} />
              </div>
              <p className="text-body-sm text-on-surface-variant mt-2">Platform-reported rating</p>
            </BentoBox>

            {/* Adjusted Rating */}
            <BentoBox delay={0.3} className="md:col-span-4 lg:col-span-3">
              <h2 className="text-h3 text-on-surface mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-green-500" />Adjusted Rating</h2>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-on-surface">{product_details.adjusted_rating.toFixed(1)}</div>
                <StarRating rating={product_details.adjusted_rating} color="green" />
              </div>
              <p className="text-body-sm text-on-surface-variant mt-2">After filtering {fakeCount} suspect reviews</p>
            </BentoBox>

            {/* Genuine */}
            <BentoBox delay={0.4} className="md:col-span-6 lg:col-span-3">
              <h2 className="text-h3 text-on-surface mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" />Genuine Reviews</h2>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">{genuineCount.toLocaleString()}</div>
                <p className="text-body-sm text-on-surface-variant">Verified authentic</p>
                <div className="mt-4 bg-green-500/10 rounded-lg p-3"><p className="text-label-caps text-green-400">{genuinePct}% of sample</p></div>
              </div>
            </BentoBox>

            {/* Fake */}
            <BentoBox delay={0.5} className="md:col-span-6 lg:col-span-3">
              <h2 className="text-h3 text-on-surface mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" />Fake Reviews</h2>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">{fakeCount.toLocaleString()}</div>
                <p className="text-body-sm text-on-surface-variant">Detected suspicious</p>
                <div className="mt-4 bg-red-500/10 rounded-lg p-3"><p className="text-label-caps text-red-400">{fakePct}% of sample</p></div>
              </div>
            </BentoBox>

            {/* Timeline */}
            <BentoBox delay={0.6} className="md:col-span-12 lg:col-span-6 min-h-[400px]">
              <h2 className="text-h3 text-on-surface mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />Rating Timeline</h2>
              <div className="h-[300px]">
                {timeline_graph_data.length > 0
                  ? <Line data={timelineData} options={timelineOptions} />
                  : <div className="flex items-center justify-center h-full text-on-surface-variant">No timeline data available</div>}
              </div>
            </BentoBox>

            {/* Clusters */}
            <BentoBox delay={0.7} className="md:col-span-12 lg:col-span-6 min-h-[400px]">
              <h2 className="text-h3 text-on-surface mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-secondary" />Reviewer Clusters</h2>
              <div className="h-[300px]">
                {reviewer_cluster_data.length > 0
                  ? <Bar data={clusterData} options={clusterOptions} />
                  : <div className="flex items-center justify-center h-full text-on-surface-variant">No cluster data available</div>}
              </div>
            </BentoBox>

            {/* Common Issues */}
            <BentoBox delay={0.8} className="md:col-span-12 min-h-[300px]">
              <h2 className="text-h3 text-on-surface mb-6 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-500" />Common Issues Detected</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {common_issues.length > 0 ? common_issues.map((issue, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${severityClass(issue.severity, "border")}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-body-lg font-semibold text-on-surface">{issue.issue}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${severityClass(issue.severity, "badge")}`}>{issue.severity}</span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant">{issue.count} instances detected</p>
                  </div>
                )) : (
                  <div className="md:col-span-4 text-center text-on-surface-variant py-8">No common issues detected</div>
                )}
              </div>
            </BentoBox>

            {/* Genuine samples */}
            <BentoBox delay={0.9} className="md:col-span-12 lg:col-span-6">
              <h2 className="text-h3 text-on-surface mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-green-500" />Genuine Review Samples</h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {reviews_breakdown.genuine_reviews.slice(0, 8).map((r, i) => (
                  <ReviewCard key={i} reviewer={r.reviewer} rating={r.rating} text={r.text} date={r.date} />
                ))}
              </div>
            </BentoBox>

            {/* Fake samples */}
            <BentoBox delay={1.0} className="md:col-span-12 lg:col-span-6">
              <h2 className="text-h3 text-on-surface mb-6 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" />Fake Review Samples</h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {reviews_breakdown.fake_reviews.slice(0, 8).map((r, i) => (
                  <ReviewCard key={i} reviewer={r.reviewer} rating={r.rating} text={r.text} date={r.date} flagReason={r.flag_reason} />
                ))}
              </div>
            </BentoBox>

          </div>

          {/* Live feed panels */}
          <section className="mt-12 grid grid-cols-1 gap-[var(--spacing-bento-gap)] md:grid-cols-12">
            <div className="glass-panel col-span-12 md:col-span-6 rounded-2xl p-8 flex flex-col overflow-hidden relative">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-error text-xl">policy</span>
                  </div>
                  <h2 className="font-h2 text-xl font-bold text-white uppercase tracking-wider">False Negative</h2>
                </div>
                <span className="px-4 py-1.5 bg-error/10 text-error border border-error/20 font-bold text-[9px] tracking-[0.15em] rounded-full uppercase">MISSED THREATS</span>
              </div>
              <div className="flex-1 min-h-[380px] relative overflow-hidden rounded-xl border border-white/5 bg-black/40">
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#050507] to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#050507] to-transparent z-10 pointer-events-none" />
                <AutoScrollFeed items={negativeItems} feedType="negative" />
              </div>
            </div>

            <div className="glass-panel col-span-12 md:col-span-6 rounded-2xl p-8 flex flex-col overflow-hidden relative">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-500 text-xl">verified_user</span>
                  </div>
                  <h2 className="font-h2 text-xl font-bold text-white uppercase tracking-wider">False Positive</h2>
                </div>
                <span className="px-4 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 font-bold text-[9px] tracking-[0.15em] rounded-full uppercase">WRONGFULLY FLAGGED</span>
              </div>
              <div className="flex-1 min-h-[380px] relative overflow-hidden rounded-xl border border-white/5 bg-black/40">
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#050507] to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#050507] to-transparent z-10 pointer-events-none" />
                <AutoScrollFeed items={positiveItems} feedType="positive" />
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

// ─── Page (fetches from backend) ──────────────────────────────────────────────

export default function AnalysisPage({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  // Note: `use(searchParams)` is React 19 server-side; we use useEffect for client fetch
  const [auditUrl, setAuditUrl] = useState("");
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Read URL from browser search params (client-side safe)
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url") || "";
    setAuditUrl(url);

    if (!url) {
      setError("No product URL provided. Please go back and enter a URL.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    analyzeProduct(url)
      .then(result => {
        if (!cancelled) { setData(result); setLoading(false); }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message || "Failed to connect to the analysis backend.");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="min-h-screen relative z-10 p-8"><LoadingSkeleton url={auditUrl} /></div>;
  if (error) return <div className="min-h-screen relative z-10 p-8"><ErrorState message={error} url={auditUrl} /></div>;
  if (!data) return null;

  return <Dashboard data={data} url={auditUrl} />;
}
