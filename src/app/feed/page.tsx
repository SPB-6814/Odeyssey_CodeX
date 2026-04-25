"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Search, Scale, AlertTriangle, ShieldCheck, TrendingUp, History } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// ----------------------------------------------------
// MOCK DATA & INTERFACES
// ----------------------------------------------------
interface MockProduct {
  id: string;
  name: string;
  category: string;
  officialRating: number;
  adjustedRating: number;
  integrityScore: number;
  isScandal: boolean;
  tags: string[];
  lastAnalyzed: string;
  humanConsensus?: string;
  longevity?: string;
  velocityData: number[];
}

const mockData: MockProduct[] = [
  {
    id: "p1",
    name: "UltraBoost Pro Max",
    category: "Electronics",
    officialRating: 4.8,
    adjustedRating: 2.1,
    integrityScore: 12,
    isScandal: true,
    tags: ["Bot Farm Detected", "Paid Reviews"],
    lastAnalyzed: "2m ago",
    velocityData: [10, 25, 45, 90, 120, 150, 155, 160, 162, 165]
  },
  {
    id: "p2",
    name: "Zenith Coffee Maker",
    category: "Home Goods",
    officialRating: 4.9,
    adjustedRating: 3.2,
    integrityScore: 35,
    isScandal: true,
    tags: ["Review Incentivization"],
    lastAnalyzed: "15m ago",
    velocityData: [5, 10, 20, 25, 30, 40, 60, 85, 110, 130]
  },
  {
    id: "p3",
    name: "Aegis Crypto Wallet",
    category: "Software",
    officialRating: 4.7,
    adjustedRating: 4.6,
    integrityScore: 98,
    isScandal: false,
    tags: ["Verified Users", "High Trust"],
    lastAnalyzed: "1h ago",
    humanConsensus: "100% clean record. Multi-sig architecture is flawless, and community audits show no vulnerabilities or malicious intents.",
    longevity: "3 yrs active",
    velocityData: [10, 12, 11, 13, 12, 14, 15, 14, 16, 15]
  },
  {
    id: "p4",
    name: "SecureDrive SSD",
    category: "Hardware",
    officialRating: 4.9,
    adjustedRating: 4.8,
    integrityScore: 95,
    isScandal: false,
    tags: ["Authentic"],
    lastAnalyzed: "3h ago",
    humanConsensus: "Hardware encryption works exactly as advertised. No hidden backup partitions or shady recovery tools pre-installed.",
    longevity: "1 yr active",
    velocityData: [50, 52, 51, 53, 54, 52, 55, 56, 54, 57]
  },
  {
    id: "p5",
    name: "GlowUp Face Serum",
    category: "Beauty",
    officialRating: 4.5,
    adjustedRating: 4.0,
    integrityScore: 75,
    isScandal: false,
    tags: ["Mixed Signals"],
    lastAnalyzed: "4h ago",
    velocityData: [100, 110, 105, 120, 115, 130, 125, 140, 135, 150]
  },
  {
    id: "p6",
    name: "FitTrack Smartwatch",
    category: "Electronics",
    officialRating: 4.2,
    adjustedRating: 3.8,
    integrityScore: 65,
    isScandal: false,
    tags: ["Natural Decay"],
    lastAnalyzed: "5h ago",
    velocityData: [80, 75, 78, 70, 72, 65, 68, 60, 62, 55]
  },
  {
    id: "p7",
    name: "VitaBlend Blender",
    category: "Home Goods",
    officialRating: 4.6,
    adjustedRating: 4.2,
    integrityScore: 82,
    isScandal: false,
    tags: ["Mostly Authentic"],
    lastAnalyzed: "8h ago",
    velocityData: [40, 42, 45, 43, 48, 50, 49, 52, 55, 54]
  }
];

// ----------------------------------------------------
// COMPONENTS
// ----------------------------------------------------
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const chartData = {
    labels: data.map((_, i) => i.toString()),
    datasets: [
      {
        data: data,
        borderColor: color,
        borderWidth: 1.5,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    scales: {
      x: { display: false },
      y: { display: false, min: Math.min(...data) * 0.9, max: Math.max(...data) * 1.1 }
    },
    animation: false as const
  };

  return (
    <div className="w-16 h-8">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default function FeedPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('feedSelectedCategories');
    if (saved) {
      setSelectedCategories(JSON.parse(saved));
    }
  }, []);

  const handleCategoryClick = (category: string) => {
    let newSelected: string[] = [];
    if (category === 'all') {
      newSelected = [];
    } else {
      if (selectedCategories.includes(category)) {
        newSelected = selectedCategories.filter(c => c !== category);
      } else {
        newSelected = [...selectedCategories, category];
      }
    }
    setSelectedCategories(newSelected);
    localStorage.setItem('feedSelectedCategories', JSON.stringify(newSelected));
  };

  const allCategories = Array.from(new Set(mockData.map(d => d.category)));

  // Data subsets
  const activeData = selectedCategories.length > 0
    ? mockData.filter(d => selectedCategories.includes(d.category))
    : mockData;

  const scandals = activeData.filter(d => (d.officialRating - d.adjustedRating) > 1.5);
  const clean = activeData.filter(d => d.integrityScore > 90);
  const others = activeData.filter(d => (d.officialRating - d.adjustedRating) <= 1.5 && d.integrityScore <= 90);

  const getCardProps = (id: string) => {
    return {
      className: `bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl p-5 transition-all flex flex-col`,
      whileHover: { scale: 1.02 }
    };
  };

  const getScoreColor = (score: number) => {
    if (score > 80) return "bg-green-400";
    if (score > 50) return "bg-yellow-500";
    return "bg-error";
  };

  if (!isClient) return null; // Avoid hydration mismatch for localStorage dependent UI

  return (
    <main className="flex-1 p-8 min-h-screen relative">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="text-primary w-6 h-6" />
            Intelligence Feed
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Real-time market surveillance and review integrity analysis.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search feed..." 
              className="w-64 bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </header>

      {/* INTEREST FILTER */}
      <div className="mb-10">
        <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Market Sectors</h3>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => handleCategoryClick('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategories.length === 0 
                ? 'bg-white/10 text-white border-white/20' 
                : 'bg-black/40 text-slate-400 border-white/5 hover:bg-white/5'
            }`}
          >
            All
          </button>
          {allCategories.map(cat => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected 
                    ? 'bg-white/10 text-white border-white/20' 
                    : 'bg-black/40 text-slate-400 border-white/5 hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTIONS */}
      <div className="flex flex-col gap-12">
        
        {/* SECTION 1: Market Scandals */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            <AlertTriangle className="text-error w-5 h-5" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Market Scandals</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {scandals.map(item => (
              <motion.div key={item.id} {...getCardProps(item.id)}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 block">{item.category}</span>
                    <h3 className="text-white font-bold text-lg">{item.name}</h3>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-error font-bold text-lg flex items-center gap-1">
                      Δ {(item.officialRating - item.adjustedRating).toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-500">Rating Inflation</span>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap mb-6">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border text-error bg-error/10 border-error/20">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-end justify-between mt-auto pt-4 border-t border-white/5">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Velocity Alert
                    </span>
                  </div>
                  <Sparkline data={item.velocityData} color="#f87171" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 2: Certified Clean */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            <ShieldCheck className="text-green-400 w-5 h-5" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Certified Clean</h2>
          </div>
            
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {clean.map(item => (
                <motion.div key={item.id} {...getCardProps(item.id)}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 block">{item.category}</span>
                      <h3 className="text-white font-bold text-lg">{item.name}</h3>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded border text-green-400 bg-green-400/10 border-green-400/20 text-[10px] font-bold uppercase">
                        <History className="w-3 h-3" /> {item.longevity}
                      </div>
                    </div>
                    
                    {/* SVG Circle Progress */}
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="24" cy="24" r="20" className="stroke-white/10 fill-none" strokeWidth="4" />
                        <circle 
                          cx="24" cy="24" r="20" 
                          className="stroke-green-400 fill-none transition-all duration-1000 ease-out" 
                          strokeWidth="4" 
                          strokeDasharray="125.6" 
                          strokeDashoffset={125.6 - (125.6 * item.integrityScore) / 100} 
                        />
                      </svg>
                      <span className="absolute text-[11px] font-bold text-green-400">{item.integrityScore}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/5 flex-1">
                    <p className="text-slate-400 italic text-sm leading-relaxed">
                      "{item.humanConsensus}"
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
        </section>

        {/* SECTION 3: The Buzz */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            <Activity className="text-slate-300 w-5 h-5" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">The Buzz</h2>
          </div>
            
          <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
            {others.map(item => (
                <motion.div key={item.id} {...getCardProps(item.id)} className="break-inside-avoid">
                  <div className="mb-4">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 block">{item.category}</span>
                    <h3 className="text-white font-bold text-lg">{item.name}</h3>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap mb-6">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border text-slate-300 bg-white/5 border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Trust Gauge */}
                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] uppercase tracking-widest text-slate-500">Trust Gauge</span>
                      <span className="text-xs font-bold text-white">{item.integrityScore}/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${getScoreColor(item.integrityScore)}`}
                        style={{ width: `${item.integrityScore}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
