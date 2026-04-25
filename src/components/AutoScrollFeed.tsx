"use client";

import { useEffect, useRef, useState } from "react";

export default function AutoScrollFeed({ items, feedType }: { items: any[], feedType: 'negative' | 'positive' }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollSpeed = 0.4; // Slightly faster, pixels per frame
    let currentY = container.scrollTop;

    const animate = () => {
      if (!isHovered && container && listRef.current) {
        currentY += scrollSpeed;
        
        const loopHeight = listRef.current.offsetHeight;
        
        // Loop back if we've scrolled past the first set exactly
        if (currentY >= loopHeight) {
          currentY -= loopHeight; // seamless jump
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
      className="absolute inset-0 overflow-y-auto no-scrollbar"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {items.length === 0 ? (
        <div className="flex h-full items-center justify-center text-slate-500 text-sm">No feed items available.</div>
      ) : (
        <>
          <div ref={listRef} className="flex flex-col gap-4 px-5 pt-5 pb-2">
            {items.map((item, i) => <FeedItem key={`1-${i}`} item={item} type={feedType} />)}
          </div>
          <div className="flex flex-col gap-4 px-5 pt-2 pb-5">
            {items.map((item, i) => <FeedItem key={`2-${i}`} item={item} type={feedType} />)}
          </div>
        </>
      )}
    </div>
  );
}

function FeedItem({ item, type }: { item: any, type: 'negative' | 'positive' }) {
  if (type === 'negative') {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:bg-white/[0.04] transition-colors shrink-0">
        <div className="flex justify-between items-start mb-3">
          <span className="font-bold text-slate-200 text-[13px]">{item.title}</span>
          <span className="font-data-mono text-[10px] text-slate-500">{item.time}</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] rounded border border-green-500/20 whitespace-nowrap">{item.status}</span>
          <span className="material-symbols-outlined text-[14px] text-slate-500">arrow_right_alt</span>
          <span className="px-2 py-1 bg-error/10 text-error/90 text-[10px] rounded border border-error/20 font-bold whitespace-nowrap">{item.issue}</span>
        </div>
        <p className="font-body-sm text-[11px] text-slate-400 leading-relaxed">Post-analysis revealed advanced evasion techniques bypassing initial heuristics.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:bg-white/[0.04] transition-colors shrink-0">
      <div className="flex justify-between items-start mb-3">
        <span className="font-bold text-slate-200 text-[13px]">{item.title}</span>
        <span className="font-data-mono text-[10px] text-slate-500">{item.time}</span>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <span className="px-2 py-1 bg-error/10 text-error/90 text-[10px] rounded border border-error/20 whitespace-nowrap">{item.status}</span>
        <span className="material-symbols-outlined text-[14px] text-slate-500">arrow_right_alt</span>
        <span className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] rounded border border-green-500/20 font-bold whitespace-nowrap">{item.resolution}</span>
      </div>
      <p className="font-body-sm text-[11px] text-slate-400 leading-relaxed">Manual review and extended behavioral context confirmed legitimate operations.</p>
    </div>
  );
}
