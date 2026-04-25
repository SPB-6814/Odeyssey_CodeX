"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RiskMeterProps {
  label: string;
  value: number; // 0 to 100
  className?: string;
}

export function RiskMeter({ label, value, className }: RiskMeterProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  
  let trackColor = "bg-primary/20";
  let fillColor = "bg-primary";
  
  if (normalizedValue >= 75) {
    trackColor = "bg-error/20";
    fillColor = "bg-error";
  } else if (normalizedValue <= 25) {
    trackColor = "bg-signal-green/20";
    fillColor = "bg-signal-green";
  }

  // Adding text colors matching logic
  const textColor = normalizedValue >= 75 ? "text-error" : (normalizedValue <= 25 ? "text-[#38A169]" : "text-primary");

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-on-surface-variant font-medium">{label}</span>
        <span className={cn("text-data-mono font-bold", textColor)}>{normalizedValue}%</span>
      </div>
      <div className={cn("h-1.5 w-full rounded-full overflow-hidden", trackColor)}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${normalizedValue}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full shadow-[0_0_8px_currentColor]", fillColor)}
          style={{ color: "inherit" }} // used for shadow if we wanted, but tailwind covers it if we set explicitly.
        />
      </div>
    </div>
  );
}
