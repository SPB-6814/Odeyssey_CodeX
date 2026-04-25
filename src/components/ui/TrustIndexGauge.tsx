"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TrustIndexGaugeProps {
  score: number;
  className?: string;
}

export function TrustIndexGauge({ score, className }: TrustIndexGaugeProps) {
  const normalizedScore = Math.min(100, Math.max(0, score));
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Determine color based on score
  let statusColor = "var(--color-primary)";
  if (score < 50) statusColor = "var(--color-signal-red)";
  else if (score >= 90) statusColor = "var(--color-signal-green)";

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        className="-rotate-90 transform"
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-tertiary)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="var(--color-surface-bright)"
          strokeWidth="12"
          fill="none"
        />

        {/* Foreground Circle */}
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke="url(#gaugeGradient)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          filter="url(#glow)"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <motion.span 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-h1"
          style={{ color: statusColor, textShadow: `0 0 10px ${statusColor}80` }}
        >
          {score}
        </motion.span>
        <span className="text-label-caps text-on-surface-variant mt-1">Trust Score</span>
      </div>
    </div>
  );
}
