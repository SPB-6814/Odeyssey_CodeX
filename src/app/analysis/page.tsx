"use client";
import { use, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BentoBox } from "@/components/ui/BentoBox";
import AutoScrollFeed from "@/components/AutoScrollFeed";
import { Line, Bar } from 'react-chartjs-2';
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
} from 'chart.js';
import { Star, Users, TrendingUp, AlertTriangle, Package, Award, Scale, Link as LinkIcon } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// --- Mock Data Product 1 ---
const p1_timelineData = {
  labels: ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'],
  datasets: [{ label: 'Rating', data: [4.2, 4.1, 4.3, 4.0, 3.8, 4.1], borderColor: '#3b82f6', backgroundColor: '#3b82f6', tension: 0.1 }],
};

const p1_clusterData = [
  { name: 'Verified Buyers', value: 65, color: '#10b981' },
  { name: 'Repeat Customers', value: 20, color: '#3b82f6' },
  { name: 'New Users', value: 10, color: '#f59e0b' },
  { name: 'Suspicious', value: 5, color: '#ef4444' },
];

const p1_clusterBarData = {
  labels: p1_clusterData.map(item => item.name),
  datasets: [{ label: 'Percentage', data: p1_clusterData.map(item => item.value), backgroundColor: p1_clusterData.map(item => item.color), borderColor: p1_clusterData.map(item => item.color), borderWidth: 1 }],
};

const p1_falseNegativeItems = [
  { title: "CryptoWallet Pro", status: "Flagged Safe", issue: "Malware Payload Detected", time: "2m ago" },
  { title: "SecureVPN Ext", status: "Clean Scan", issue: "Data Exfiltration", time: "15m ago" },
  { title: "DefiSwap Portal", status: "No Threat", issue: "Phishing Redirect", time: "1h ago" },
  { title: "AuthGuard App", status: "Trusted", issue: "Credential Harvesting", time: "3h ago" },
  { title: "SafeBrowser AI", status: "Verified", issue: "Hidden Tracker", time: "4h ago" },
];

const p1_falsePositiveItems = [
  { title: "IndieGame Studio", status: "Blocked", resolution: "Verified Authentic", time: "10m ago" },
  { title: "CharityFund DAO", status: "High Risk", resolution: "Legitimate Entity", time: "45m ago" },
  { title: "LocalNews Blog", status: "Bot Activity", resolution: "Organic Viral Traffic", time: "2h ago" },
  { title: "ArtisanMarket", status: "Scam Warning", resolution: "Secure Transactions", time: "5h ago" },
  { title: "OpenSource Hub", status: "Suspicious", resolution: "Code Repository", time: "6h ago" },
];

const p1_commonIssues = [
  { issue: 'Fake reviews detected', count: 23, severity: 'high' },
  { issue: 'Inconsistent ratings', count: 15, severity: 'medium' },
  { issue: 'Bot-like patterns', count: 8, severity: 'low' },
  { issue: 'Duplicate content', count: 12, severity: 'medium' },
];

const p1_product = { name: "Wireless Bluetooth Headphones", category: "Electronics", price: "$49.99 - $79.99", reviews: "1,247", originalRating: 4.1, adjustedRating: 3.7, genuineCount: 892, genuinePercent: 71.5, fakeCount: 355, fakePercent: 28.5 };

// --- Mock Data Product 2 ---
const p2_timelineData = {
  labels: ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'],
  datasets: [{ label: 'Rating', data: [4.6, 4.5, 4.7, 4.6, 4.8, 4.7], borderColor: '#8b5cf6', backgroundColor: '#8b5cf6', tension: 0.1 }],
};

const p2_clusterData = [
  { name: 'Verified Buyers', value: 85, color: '#10b981' },
  { name: 'Repeat Customers', value: 10, color: '#3b82f6' },
  { name: 'New Users', value: 4, color: '#f59e0b' },
  { name: 'Suspicious', value: 1, color: '#ef4444' },
];

const p2_clusterBarData = {
  labels: p2_clusterData.map(item => item.name),
  datasets: [{ label: 'Percentage', data: p2_clusterData.map(item => item.value), backgroundColor: p2_clusterData.map(item => item.color), borderColor: p2_clusterData.map(item => item.color), borderWidth: 1 }],
};

const p2_falseNegativeItems = [
  { title: "UltraSound Pods", status: "Safe", issue: "Minor tracking", time: "12m ago" },
  { title: "AudioMax Pro", status: "Verified", issue: "Background activity", time: "2h ago" },
  { title: "SoundWave", status: "Clean", issue: "Ad injection", time: "5h ago" },
];

const p2_falsePositiveItems = [
  { title: "MusicStream App", status: "Blocked", resolution: "False Alarm", time: "30m ago" },
  { title: "Podcast Player", status: "Warning", resolution: "Legitimate", time: "1h ago" },
];

const p2_commonIssues = [
  { issue: 'Minor inconsistencies', count: 4, severity: 'low' },
  { issue: 'Short reviews', count: 12, severity: 'low' },
];

const p2_product = { name: "Noise Cancelling Earbuds", category: "Electronics", price: "$89.99 - $129.99", reviews: "3,412", originalRating: 4.6, adjustedRating: 4.5, genuineCount: 3200, genuinePercent: 93.8, fakeCount: 212, fakePercent: 6.2 };


export default function AnalysisPage({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const params = use(searchParams);
  const auditUrl = params?.url || "Unknown Product";
  
  const [compareMode, setCompareMode] = useState(false);
  const [url1, setUrl1] = useState(auditUrl);
  const [url2, setUrl2] = useState("");

  const renderStars = (rating: number, colorClass: string) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className={`w-6 h-6 fill-current ${colorClass}`} />);
      } else if (i === fullStars && hasHalf) {
        // Half star visualization (simplified as filled for now, ideally an SVG half-fill)
        stars.push(<Star key={i} className={`w-6 h-6 fill-current ${colorClass} opacity-50`} />);
      } else {
        stars.push(<Star key={i} className={`w-6 h-6 ${colorClass}`} />);
      }
    }
    return stars;
  };

  return (
    <main className="min-h-screen p-[var(--spacing-margin)] max-w-[1600px] mx-auto w-full relative z-10">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 text-on-surface flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Product Review Analysis
          </h1>
          {!compareMode && <p className="text-body-lg text-on-surface-variant mt-1 font-data-mono">Target: {auditUrl}</p>}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
              compareMode 
                ? 'bg-primary/20 text-primary border-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' 
                : 'bg-surface-container text-on-surface border-outline-variant/30 hover:bg-white/5'
            }`}
          >
            <Scale className="w-4 h-4" />
            {compareMode ? 'Exit Compare' : 'Compare'}
          </button>
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-signal-green shadow-[0_0_8px_var(--color-signal-green)] animate-pulse" />
            <span className="text-label-caps text-on-surface">Analysis Complete</span>
          </div>
        </div>
      </header>

      {compareMode ? (
        // COMPARISON VIEW
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -20 }}
          className="space-y-8"
        >
          {/* URL Input Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-primary" />
              </div>
              <input 
                type="text" 
                value={url1}
                onChange={(e) => setUrl1(e.target.value)}
                placeholder="Paste first product URL here..."
                className="w-full bg-surface-container/80 border border-primary/30 text-on-surface rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-data-mono"
              />
              <div className="absolute top-0 right-4 -translate-y-1/2 bg-surface px-2 text-xs font-bold text-primary tracking-wider uppercase">Product 1</div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-secondary" />
              </div>
              <input 
                type="text" 
                value={url2}
                onChange={(e) => setUrl2(e.target.value)}
                placeholder="Paste second product URL here to compare..."
                className="w-full bg-surface-container/80 border border-secondary/30 text-on-surface rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all font-data-mono"
              />
              <div className="absolute top-0 right-4 -translate-y-1/2 bg-surface px-2 text-xs font-bold text-secondary tracking-wider uppercase">Product 2</div>
            </div>
          </div>

          <div className="space-y-12">
            
            {/* 1. Product Info */}
            <div>
              <h3 className="text-h3 text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                <Package className="w-5 h-5 text-primary" /> 1. Product Info
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BentoBox delay={0.1} className="border-t-2 border-t-primary/50">
                  <div className="space-y-3">
                    <div><p className="text-label-caps text-on-surface-variant">Product Name</p><p className="text-body-lg text-on-surface">{p1_product.name}</p></div>
                    <div><p className="text-label-caps text-on-surface-variant">Category</p><p className="text-body-lg text-on-surface">{p1_product.category}</p></div>
                    <div><p className="text-label-caps text-on-surface-variant">Price Range</p><p className="text-body-lg text-on-surface">{p1_product.price}</p></div>
                    <div><p className="text-label-caps text-on-surface-variant">Total Reviews</p><p className="text-body-lg text-on-surface">{p1_product.reviews}</p></div>
                  </div>
                </BentoBox>
                <BentoBox delay={0.1} className="border-t-2 border-t-secondary/50">
                  <div className="space-y-3">
                    <div><p className="text-label-caps text-on-surface-variant">Product Name</p><p className="text-body-lg text-on-surface">{url2 ? p2_product.name : "Waiting for URL..."}</p></div>
                    <div><p className="text-label-caps text-on-surface-variant">Category</p><p className="text-body-lg text-on-surface">{url2 ? p2_product.category : "-"}</p></div>
                    <div><p className="text-label-caps text-on-surface-variant">Price Range</p><p className="text-body-lg text-on-surface">{url2 ? p2_product.price : "-"}</p></div>
                    <div><p className="text-label-caps text-on-surface-variant">Total Reviews</p><p className="text-body-lg text-on-surface">{url2 ? p2_product.reviews : "-"}</p></div>
                  </div>
                </BentoBox>
              </div>
            </div>

            {/* 2. Original Rating */}
            <div>
              <h3 className="text-h3 text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                <Star className="w-5 h-5 text-yellow-500" /> 2. Original Rating
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BentoBox delay={0.2}>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-on-surface">{p1_product.originalRating}</div>
                    <div className="flex">{renderStars(p1_product.originalRating, "text-yellow-400")}</div>
                  </div>
                </BentoBox>
                <BentoBox delay={0.2} className={!url2 ? "opacity-50 pointer-events-none" : ""}>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-on-surface">{url2 ? p2_product.originalRating : "-"}</div>
                    <div className="flex">{url2 ? renderStars(p2_product.originalRating, "text-yellow-400") : null}</div>
                  </div>
                </BentoBox>
              </div>
            </div>

            {/* 3. Adjusted Rating */}
            <div>
              <h3 className="text-h3 text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                <Award className="w-5 h-5 text-green-500" /> 3. Adjusted Rating
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BentoBox delay={0.3}>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-on-surface">{p1_product.adjustedRating}</div>
                    <div className="flex">{renderStars(p1_product.adjustedRating, "text-green-400")}</div>
                  </div>
                  <p className="text-body-sm text-on-surface-variant mt-2">After filtering suspicious reviews</p>
                </BentoBox>
                <BentoBox delay={0.3} className={!url2 ? "opacity-50 pointer-events-none" : ""}>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-on-surface">{url2 ? p2_product.adjustedRating : "-"}</div>
                    <div className="flex">{url2 ? renderStars(p2_product.adjustedRating, "text-green-400") : null}</div>
                  </div>
                  <p className="text-body-sm text-on-surface-variant mt-2">After filtering suspicious reviews</p>
                </BentoBox>
              </div>
            </div>

            {/* 4. Genuine Reviews */}
            <div>
              <h3 className="text-h3 text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                <Users className="w-5 h-5 text-blue-500" /> 4. Genuine Reviews
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BentoBox delay={0.4}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-2">{p1_product.genuineCount}</div>
                    <div className="mt-4 bg-green-500/10 rounded-lg p-3">
                      <p className="text-label-caps text-green-400">{p1_product.genuinePercent}% of total</p>
                    </div>
                  </div>
                </BentoBox>
                <BentoBox delay={0.4} className={!url2 ? "opacity-50 pointer-events-none" : ""}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-2">{url2 ? p2_product.genuineCount : "-"}</div>
                    <div className="mt-4 bg-green-500/10 rounded-lg p-3">
                      <p className="text-label-caps text-green-400">{url2 ? p2_product.genuinePercent + "% of total" : "-"}</p>
                    </div>
                  </div>
                </BentoBox>
              </div>
            </div>

            {/* 5. Fake Reviews */}
            <div>
              <h3 className="text-h3 text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> 5. Fake Reviews
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BentoBox delay={0.5}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500 mb-2">{p1_product.fakeCount}</div>
                    <div className="mt-4 bg-red-500/10 rounded-lg p-3">
                      <p className="text-label-caps text-red-400">{p1_product.fakePercent}% of total</p>
                    </div>
                  </div>
                </BentoBox>
                <BentoBox delay={0.5} className={!url2 ? "opacity-50 pointer-events-none" : ""}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500 mb-2">{url2 ? p2_product.fakeCount : "-"}</div>
                    <div className="mt-4 bg-red-500/10 rounded-lg p-3">
                      <p className="text-label-caps text-red-400">{url2 ? p2_product.fakePercent + "% of total" : "-"}</p>
                    </div>
                  </div>
                </BentoBox>
              </div>
            </div>

            {/* 6. Rating Timeline */}
            <div>
              <h3 className="text-h3 text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                <TrendingUp className="w-5 h-5 text-primary" /> 6. Rating Timeline
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BentoBox delay={0.6} className="h-[300px]">
                  <Line data={p1_timelineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 3.5, max: 4.5, grid: { color: '#374151' }, ticks: { color: '#9ca3af' } }, x: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } } } }} />
                </BentoBox>
                <BentoBox delay={0.6} className={`h-[300px] ${!url2 ? 'opacity-50 pointer-events-none' : ''}`}>
                  {url2 ? <Line data={p2_timelineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 3.5, max: 5.0, grid: { color: '#374151' }, ticks: { color: '#9ca3af' } }, x: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } } } }} /> : <div className="flex h-full items-center justify-center text-on-surface-variant">Enter URL to view timeline</div>}
                </BentoBox>
              </div>
            </div>

            {/* 7. Review Clusters */}
            <div>
              <h3 className="text-h3 text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                <Users className="w-5 h-5 text-secondary" /> 7. Review Clusters
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BentoBox delay={0.7} className="h-[300px]">
                  <Bar data={p1_clusterBarData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { max: 80, grid: { color: '#374151' }, ticks: { color: '#9ca3af', callback: (v) => v + '%' } }, x: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } } } }} />
                </BentoBox>
                <BentoBox delay={0.7} className={`h-[300px] ${!url2 ? 'opacity-50 pointer-events-none' : ''}`}>
                  {url2 ? <Bar data={p2_clusterBarData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { max: 100, grid: { color: '#374151' }, ticks: { color: '#9ca3af', callback: (v) => v + '%' } }, x: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } } } }} /> : <div className="flex h-full items-center justify-center text-on-surface-variant">Enter URL to view clusters</div>}
                </BentoBox>
              </div>
            </div>

            {/* 8. Common Issues Detected */}
            <div>
              <h3 className="text-h3 text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" /> 8. Common Issues Detected
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BentoBox delay={0.8}>
                  <div className="space-y-4">
                    {p1_commonIssues.map((issue, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border ${issue.severity === 'high' ? 'border-red-500/30 bg-red-500/5' : issue.severity === 'medium' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-blue-500/30 bg-blue-500/5'} flex justify-between items-center`}>
                        <div>
                          <p className="text-body-lg font-semibold text-on-surface">{issue.issue}</p>
                          <p className="text-body-sm text-on-surface-variant">{issue.count} instances</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${issue.severity === 'high' ? 'bg-red-500/20 text-red-400' : issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>{issue.severity}</span>
                      </div>
                    ))}
                  </div>
                </BentoBox>
                <BentoBox delay={0.8} className={!url2 ? "opacity-50 pointer-events-none" : ""}>
                  <div className="space-y-4">
                    {url2 ? p2_commonIssues.map((issue, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border ${issue.severity === 'high' ? 'border-red-500/30 bg-red-500/5' : issue.severity === 'medium' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-blue-500/30 bg-blue-500/5'} flex justify-between items-center`}>
                        <div>
                          <p className="text-body-lg font-semibold text-on-surface">{issue.issue}</p>
                          <p className="text-body-sm text-on-surface-variant">{issue.count} instances</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${issue.severity === 'high' ? 'bg-red-500/20 text-red-400' : issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>{issue.severity}</span>
                      </div>
                    )) : <div className="text-on-surface-variant text-center py-4">Enter URL to view issues</div>}
                  </div>
                </BentoBox>
              </div>
            </div>

            {/* 9. False Positives & Negatives */}
            <div>
              <h3 className="text-h3 text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                <AlertTriangle className="w-5 h-5 text-purple-500" /> 9. False Positives & Negatives
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product 1 Feeds */}
                <div className="space-y-8">
                  <div className="glass-panel rounded-2xl p-6 flex flex-col overflow-hidden relative">
                    <h4 className="font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-error/10 text-error flex items-center justify-center material-symbols-outlined text-sm">policy</span>False Negatives</h4>
                    <div className="flex-1 min-h-[300px] relative overflow-hidden rounded-xl border border-white/5 bg-black/40">
                      <AutoScrollFeed items={p1_falseNegativeItems} feedType="negative" />
                    </div>
                  </div>
                  <div className="glass-panel rounded-2xl p-6 flex flex-col overflow-hidden relative">
                    <h4 className="font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center material-symbols-outlined text-sm">verified_user</span>False Positives</h4>
                    <div className="flex-1 min-h-[300px] relative overflow-hidden rounded-xl border border-white/5 bg-black/40">
                      <AutoScrollFeed items={p1_falsePositiveItems} feedType="positive" />
                    </div>
                  </div>
                </div>

                {/* Product 2 Feeds */}
                <div className={`space-y-8 ${!url2 ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="glass-panel rounded-2xl p-6 flex flex-col overflow-hidden relative">
                    <h4 className="font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-error/10 text-error flex items-center justify-center material-symbols-outlined text-sm">policy</span>False Negatives</h4>
                    <div className="flex-1 min-h-[300px] relative overflow-hidden rounded-xl border border-white/5 bg-black/40 flex items-center justify-center">
                      {url2 ? <AutoScrollFeed items={p2_falseNegativeItems} feedType="negative" /> : <p className="text-on-surface-variant">Enter URL</p>}
                    </div>
                  </div>
                  <div className="glass-panel rounded-2xl p-6 flex flex-col overflow-hidden relative">
                    <h4 className="font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center material-symbols-outlined text-sm">verified_user</span>False Positives</h4>
                    <div className="flex-1 min-h-[300px] relative overflow-hidden rounded-xl border border-white/5 bg-black/40 flex items-center justify-center">
                      {url2 ? <AutoScrollFeed items={p2_falsePositiveItems} feedType="positive" /> : <p className="text-on-surface-variant">Enter URL</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      ) : (
        // STANDARD DASHBOARD VIEW
        <>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-[var(--spacing-bento-gap)] auto-rows-min">
            {/* Product Info */}
            <BentoBox delay={0.1} className="md:col-span-4 lg:col-span-3">
              <h2 className="text-h3 text-on-surface mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Product Info
              </h2>
              <div className="space-y-3">
                <div><p className="text-label-caps text-on-surface-variant">Product Name</p><p className="text-body-lg text-on-surface">{p1_product.name}</p></div>
                <div><p className="text-label-caps text-on-surface-variant">Category</p><p className="text-body-lg text-on-surface">{p1_product.category}</p></div>
                <div><p className="text-label-caps text-on-surface-variant">Price Range</p><p className="text-body-lg text-on-surface">{p1_product.price}</p></div>
                <div><p className="text-label-caps text-on-surface-variant">Total Reviews</p><p className="text-body-lg text-on-surface">{p1_product.reviews}</p></div>
              </div>
            </BentoBox>

            {/* Original Rating */}
            <BentoBox delay={0.2} className="md:col-span-4 lg:col-span-3">
              <h2 className="text-h3 text-on-surface mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Original Rating
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-on-surface">{p1_product.originalRating}</div>
                <div className="flex">{renderStars(p1_product.originalRating, "text-yellow-400")}</div>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-2">Based on {p1_product.reviews} reviews</p>
            </BentoBox>

            {/* Adjusted Rating */}
            <BentoBox delay={0.3} className="md:col-span-4 lg:col-span-3">
              <h2 className="text-h3 text-on-surface mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-500" />
                Adjusted Rating
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-on-surface">{p1_product.adjustedRating}</div>
                <div className="flex">{renderStars(p1_product.adjustedRating, "text-green-400")}</div>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-2">After filtering suspicious reviews</p>
            </BentoBox>

            {/* Fake vs Genuine Reviews */}
            <BentoBox delay={0.4} className="md:col-span-6 lg:col-span-3">
              <h2 className="text-h3 text-on-surface mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Genuine Reviews
              </h2>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">{p1_product.genuineCount}</div>
                <p className="text-body-sm text-on-surface-variant">Verified authentic reviews</p>
                <div className="mt-4 bg-green-500/10 rounded-lg p-3">
                  <p className="text-label-caps text-green-400">{p1_product.genuinePercent}% of total</p>
                </div>
              </div>
            </BentoBox>

            <BentoBox delay={0.5} className="md:col-span-6 lg:col-span-3">
              <h2 className="text-h3 text-on-surface mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Fake Reviews
              </h2>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">{p1_product.fakeCount}</div>
                <p className="text-body-sm text-on-surface-variant">Detected suspicious reviews</p>
                <div className="mt-4 bg-red-500/10 rounded-lg p-3">
                  <p className="text-label-caps text-red-400">{p1_product.fakePercent}% of total</p>
                </div>
              </div>
            </BentoBox>

            {/* Timeline Graph */}
            <BentoBox delay={0.6} className="md:col-span-12 lg:col-span-6 min-h-[400px]">
              <h2 className="text-h3 text-on-surface mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Rating Timeline
              </h2>
              <div className="h-[300px]">
                <Line
                  data={p1_timelineData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { min: 3.5, max: 4.5, grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
                      x: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
                    },
                  }}
                />
              </div>
            </BentoBox>

            {/* Reviewer Cluster Visualization */}
            <BentoBox delay={0.7} className="md:col-span-12 lg:col-span-6 min-h-[400px]">
              <h2 className="text-h3 text-on-surface mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                Reviewer Clusters
              </h2>
              <div className="h-[300px]">
                <Bar
                  data={p1_clusterBarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { max: 80, grid: { color: '#374151' }, ticks: { color: '#9ca3af', callback: function(value) { return value + '%'; } } },
                      x: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
                    },
                  }}
                />
              </div>
            </BentoBox>

            {/* Common Issues Section */}
            <BentoBox delay={0.8} className="md:col-span-12 min-h-[300px]">
              <h2 className="text-h3 text-on-surface mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Common Issues Detected
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {p1_commonIssues.map((issue, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${issue.severity === 'high' ? 'border-red-500/30 bg-red-500/5' : issue.severity === 'medium' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-blue-500/30 bg-blue-500/5'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-body-lg font-semibold text-on-surface">{issue.issue}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${issue.severity === 'high' ? 'bg-red-500/20 text-red-400' : issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>{issue.severity}</span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant">{issue.count} instances detected</p>
                  </div>
                ))}
              </div>
            </BentoBox>
          </div>

          {/* False Negative / False Positive Showcase */}
          <section className="mt-12 grid grid-cols-1 gap-[var(--spacing-bento-gap)] md:grid-cols-12">
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
                <AutoScrollFeed items={p1_falseNegativeItems} feedType="negative" />
              </div>
            </div>

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
                <AutoScrollFeed items={p1_falsePositiveItems} feedType="positive" />
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
