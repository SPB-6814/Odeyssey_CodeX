"use client";
import { BentoBox } from "@/components/ui/BentoBox";
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
import { Star, Users, TrendingUp, AlertTriangle, Package, Award } from "lucide-react";

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

// Mock Data for Dashboard
const timelineData = {
  labels: ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'],
  datasets: [
    {
      label: 'Rating',
      data: [4.2, 4.1, 4.3, 4.0, 3.8, 4.1],
      borderColor: '#3b82f6',
      backgroundColor: '#3b82f6',
      tension: 0.1,
    },
  ],
};

const clusterData = [
  { name: 'Verified Buyers', value: 65, color: '#10b981' },
  { name: 'Repeat Customers', value: 20, color: '#3b82f6' },
  { name: 'New Users', value: 10, color: '#f59e0b' },
  { name: 'Suspicious', value: 5, color: '#ef4444' },
];

const clusterBarData = {
  labels: clusterData.map(item => item.name),
  datasets: [
    {
      label: 'Percentage',
      data: clusterData.map(item => item.value),
      backgroundColor: clusterData.map(item => item.color),
      borderColor: clusterData.map(item => item.color),
      borderWidth: 1,
    },
  ],
};

const commonIssues = [
  { issue: 'Fake reviews detected', count: 23, severity: 'high' },
  { issue: 'Inconsistent ratings', count: 15, severity: 'medium' },
  { issue: 'Bot-like patterns', count: 8, severity: 'low' },
  { issue: 'Duplicate content', count: 12, severity: 'medium' },
];

export default async function AnalysisPage({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const params = await searchParams;
  const auditUrl = params?.url || "Unknown Product";

  return (
    <main className="min-h-screen p-[var(--spacing-margin)] max-w-[1600px] mx-auto w-full relative z-10">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 text-on-surface flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Product Review Analysis
          </h1>
          <p className="text-body-lg text-on-surface-variant mt-1 font-data-mono">Target: {auditUrl}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-signal-green shadow-[0_0_8px_var(--color-signal-green)] animate-pulse" />
            <span className="text-label-caps text-on-surface">Analysis Complete</span>
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-[var(--spacing-bento-gap)] auto-rows-min">

        {/* Product Info */}
        <BentoBox delay={0.1} className="md:col-span-4 lg:col-span-3">
          <h2 className="text-h3 text-on-surface mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Product Info
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-label-caps text-on-surface-variant">Product Name</p>
              <p className="text-body-lg text-on-surface">Wireless Bluetooth Headphones</p>
            </div>
            <div>
              <p className="text-label-caps text-on-surface-variant">Category</p>
              <p className="text-body-lg text-on-surface">Electronics</p>
            </div>
            <div>
              <p className="text-label-caps text-on-surface-variant">Price Range</p>
              <p className="text-body-lg text-on-surface">$49.99 - $79.99</p>
            </div>
            <div>
              <p className="text-label-caps text-on-surface-variant">Total Reviews</p>
              <p className="text-body-lg text-on-surface">1,247</p>
            </div>
          </div>
        </BentoBox>

        {/* Original Rating */}
        <BentoBox delay={0.2} className="md:col-span-4 lg:col-span-3">
          <h2 className="text-h3 text-on-surface mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Original Rating
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-on-surface">4.1</div>
            <div className="flex">
              {[1,2,3,4].map((star) => (
                <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-2">Based on 1,247 reviews</p>
        </BentoBox>

        {/* Adjusted Rating */}
        <BentoBox delay={0.3} className="md:col-span-4 lg:col-span-3">
          <h2 className="text-h3 text-on-surface mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-500" />
            Adjusted Rating
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-on-surface">3.7</div>
            <div className="flex">
              {[1,2,3].map((star) => (
                <Star key={star} className="w-6 h-6 fill-green-400 text-green-400" />
              ))}
              <Star className="w-6 h-6 text-green-400" />
              <Star className="w-6 h-6 text-green-400" />
            </div>
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
            <div className="text-3xl font-bold text-green-500 mb-2">892</div>
            <p className="text-body-sm text-on-surface-variant">Verified authentic reviews</p>
            <div className="mt-4 bg-green-500/10 rounded-lg p-3">
              <p className="text-label-caps text-green-400">71.5% of total</p>
            </div>
          </div>
        </BentoBox>

        <BentoBox delay={0.5} className="md:col-span-6 lg:col-span-3">
          <h2 className="text-h3 text-on-surface mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Fake Reviews
          </h2>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500 mb-2">355</div>
            <p className="text-body-sm text-on-surface-variant">Detected suspicious reviews</p>
            <div className="mt-4 bg-red-500/10 rounded-lg p-3">
              <p className="text-label-caps text-red-400">28.5% of total</p>
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
              data={timelineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    min: 3.5,
                    max: 4.5,
                    grid: {
                      color: '#374151',
                    },
                    ticks: {
                      color: '#9ca3af',
                    },
                  },
                  x: {
                    grid: {
                      color: '#374151',
                    },
                    ticks: {
                      color: '#9ca3af',
                    },
                  },
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
              data={clusterBarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 80,
                    grid: {
                      color: '#374151',
                    },
                    ticks: {
                      color: '#9ca3af',
                      callback: function(value) {
                        return value + '%';
                      },
                    },
                  },
                  x: {
                    grid: {
                      color: '#374151',
                    },
                    ticks: {
                      color: '#9ca3af',
                    },
                  },
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
            {commonIssues.map((issue, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  issue.severity === 'high'
                    ? 'border-red-500/30 bg-red-500/5'
                    : issue.severity === 'medium'
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : 'border-blue-500/30 bg-blue-500/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-body-lg font-semibold text-on-surface">{issue.issue}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      issue.severity === 'high'
                        ? 'bg-red-500/20 text-red-400'
                        : issue.severity === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {issue.severity}
                  </span>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  {issue.count} instances detected
                </p>
              </div>
            ))}
          </div>
        </BentoBox>

      </div>
    </main>
  );
}
