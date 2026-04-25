"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoBoxProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function BentoBox({ children, className, delay = 0, ...props }: BentoBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1] 
      }}
      className={cn(
        "bento-glass p-[var(--spacing-container-padding)] flex flex-col overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
