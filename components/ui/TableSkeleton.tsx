"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/animations/Skeleton";

const DEFAULT_MESSAGES = [
  "Warming up tyres...",
  "Loading telemetry...",
  "Adjusting front wing...",
  "Box box box...",
  "Charging ERS...",
];

export type TableSkeletonProps = {
  rowCount?: number;
  rowHeight?: number | string;
  className?: string;
  messages?: string[];
};

export function TableSkeleton({
  rowCount = 5,
  rowHeight = 16,
  className = "",
  messages = DEFAULT_MESSAGES,
}: TableSkeletonProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!messages.length) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className={`relative w-full flex flex-col ${className}`}>
      {/* Background skeletons */}
      <div className="opacity-40">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className="border-b border-border-subtle/50 px-3 py-2.5">
            <Skeleton height={rowHeight} className="w-full opacity-60" />
          </div>
        ))}
      </div>

      {/* Centered Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-red" />
        
        {messages.length > 0 && (
          <div className="relative h-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={msgIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="font-mono text-xs text-text-dim text-center uppercase tracking-wider"
              >
                {messages[msgIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
