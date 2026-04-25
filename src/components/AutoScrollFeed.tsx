"use client";

import { useEffect, useRef, useState } from "react";

export default function AutoScrollFeed({ items, feedType }: { items: any[], feedType: 'negative' | 'positive' }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const requestRef = useRef<number>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollSpeed = 0.3; // pixels per frame
    let currentY = container.scrollTop;

    const animate = () => {
      if (!isHovered && container) {
        currentY += scrollSpeed;
        
        // Loop back if we've scrolled past the first set
        if (currentY >= container.scrollHeight / 2) {
          currentY = 0;
        }
        container.scrollTop = currentY;
      } else if (isHovered && container) {
        // Sync the accumulator if the user scrolls manually
        currentY = container.scrollTop;
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isHovered]);

  return (
    <div 
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`absolute inset-0 ${isHovered ? 'overflow-y-auto no-scrollbar' : 'overflow-hidden'}`}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Render two sets for seamless looping */}
      <div className="flex flex-col px-4 pt-4 gap-4">
        {items.map((item, i) => <FeedItem key={`1-${i}`} item={item} type={feedType} />)}
      </div>
      <div className="flex flex-col px-4 pt-4 pb-4 gap-4">
        {items.map((item, i) => <FeedItem key={`2-${i}`} item={item} type={feedType} />)}
      </div>
    </div>
  );
}

function FeedItem({ item, type }: { item: any, type: 'negative' | 'positive' }) {
  if (type === 'negative') {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors shrink-0">
        <div className="flex justify-between items-start mb-2">
          <span className="font-bold text-white font-body-sm">{item.title}</span>
          <span className="font-data-mono text-[10px] text-slate-500">{item.time}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded border border-green-500/20">{item.status}</span>
          <span className="material-symbols-outlined text-[14px] text-slate-500">arrow_right_alt</span>
          <span className="px-2 py-0.5 bg-error/10 text-error text-[10px] rounded border border-error/20 font-bold">{item.issue}</span>
        </div>
        <p className="font-body-sm text-xs text-slate-400">Post-analysis revealed advanced evasion techniques bypassing initial heuristics.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors shrink-0">
      <div className="flex justify-between items-start mb-2">
        <span className="font-bold text-white font-body-sm">{item.title}</span>
        <span className="font-data-mono text-[10px] text-slate-500">{item.time}</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-0.5 bg-error/10 text-error text-[10px] rounded border border-error/20">{item.status}</span>
        <span className="material-symbols-outlined text-[14px] text-slate-500">arrow_right_alt</span>
        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded border border-green-500/20 font-bold">{item.resolution}</span>
      </div>
      <p className="font-body-sm text-xs text-slate-400">Manual review and extended behavioral context confirmed legitimate operations.</p>
    </div>
  );
}
