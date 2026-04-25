"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Ping {
  id: string;
  x: number;
  y: number;
  intensity: "low" | "high";
}

interface LivePulseMapProps {
  pings: Ping[];
  className?: string;
}

export function LivePulseMap({ pings, className }: LivePulseMapProps) {
  return (
    <div className={cn("relative w-full h-full bg-surface-container rounded-md overflow-hidden", className)}>
      {/* Abstract Grid Background to look like a tool */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(var(--color-outline-variant) 1px, transparent 1px), linear-gradient(90deg, var(--color-outline-variant) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Simplified Map SVG (Abstract representations) */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-30 drop-shadow-md" 
        viewBox="0 0 800 400" 
        preserveAspectRatio="xMidYMid slice"
        fill="var(--color-primary-container)"
        stroke="var(--color-secondary-container)"
        strokeWidth="1"
      >
        <path d="M 150 100 Q 200 50, 250 100 T 350 150 Q 400 100, 450 120 T 550 80 Q 600 50, 700 120 L 700 300 L 150 300 Z" />
        <path d="M 50 150 Q 100 200, 150 180 T 250 250 Q 300 300, 400 280 T 600 320 L 600 380 L 50 380 Z" opacity="0.5"/>
        <path d="M 400 50 Q 450 20, 500 60 T 600 40 L 600 100 L 400 100 Z" opacity="0.3"/>
      </svg>

      {/* Pings */}
      {pings.map((ping) => {
        const color = ping.intensity === "high" ? "var(--color-signal-red)" : "var(--color-secondary)";
        return (
          <div
            key={ping.id}
            className="absolute rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `${ping.x}%`, 
              top: `${ping.y}%`,
            }}
          >
            <div 
              className="w-2 h-2 rounded-full relative z-10"
              style={{ backgroundColor: color }}
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute inset-0 rounded-full w-2 h-2"
              style={{ backgroundColor: color }}
            />
          </div>
        );
      })}
      
      <div className="absolute bottom-4 right-4 text-data-mono text-on-surface-variant bg-surface-container-high px-2 py-1 rounded border border-outline-variant/50 text-xs">
        LIVE_SYNC: ACTIVE
      </div>
    </div>
  );
}
