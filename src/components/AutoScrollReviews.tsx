"use client";

import { useEffect, useRef, useState } from "react";

export default function AutoScrollReviews({ items }: { items: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollSpeed = 0.4;
    let currentY = container.scrollTop;

    const animate = () => {
      if (!isHovered && container && listRef.current) {
        currentY += scrollSpeed;
        
        const loopHeight = listRef.current.offsetHeight;
        
        if (currentY >= loopHeight) {
          currentY -= loopHeight;
        }
        container.scrollTop = currentY;
      } else if (isHovered && container) {
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
        <div className="flex h-full items-center justify-center text-slate-500 text-sm">No reviews available.</div>
      ) : (
        <>
          <div ref={listRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 pt-8 pb-4">
            {items.map((review, i) => <ReviewItem key={`1-${i}`} review={review} />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 pt-4 pb-8">
            {items.map((review, i) => <ReviewItem key={`2-${i}`} review={review} />)}
          </div>
        </>
      )}
    </div>
  );
}

function ReviewItem({ review }: { review: any }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-8 hover:bg-white/[0.08] transition-all cursor-pointer group flex flex-col h-full">
      <div className="flex items-start justify-between mb-6">
        <div className={`w-12 h-12 rounded-xl ${review.iconBgClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <span className={`material-symbols-outlined ${review.iconTextClass} text-2xl`}>{review.icon}</span>
        </div>
        <div className="flex text-yellow-500">
          <span className="material-symbols-outlined text-sm">star</span>
          <span className="material-symbols-outlined text-sm">star</span>
          <span className="material-symbols-outlined text-sm">star</span>
          <span className="material-symbols-outlined text-sm">star</span>
          <span className="material-symbols-outlined text-sm">star</span>
        </div>
      </div>
      <h4 className="font-h3 text-lg text-white mb-2 font-bold">{review.title}</h4>
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded border border-green-500/20 font-bold uppercase">100% Verified Clean</span>
      </div>
      <div className="bg-black/40 rounded-xl p-4 mt-auto border border-white/5 relative">
        <span className="material-symbols-outlined absolute -top-3 -left-2 text-slate-600 text-3xl opacity-50">format_quote</span>
        <p className="font-body-sm text-slate-300 italic text-sm relative z-10">{review.review}</p>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
          <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">{review.initials}</div>
          <span className="text-[10px] text-slate-400">{review.author}</span>
        </div>
      </div>
    </div>
  );
}
