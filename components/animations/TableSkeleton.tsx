'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from './Skeleton';

type TableSkeletonProps = {
  rows?: number;
  customTexts?: string[];
  className?: string;
  rowHeight?: number;
};

const DEFAULT_TEXTS = [
  "Synchronizing session data...",
  "Fetching track telemetry...",
  "Updating championship standings...",
  "Processing race results...",
];

export function TableSkeleton({
  rows = 5,
  customTexts = DEFAULT_TEXTS,
  className = "",
  rowHeight = 32
}: TableSkeletonProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [showHeavyMessage, setShowHeavyMessage] = useState(false);

  // Combine default/custom texts with the "heavy data" message after 5s
  const activeTexts = useMemo(() => {
    const list = [...customTexts];
    if (showHeavyMessage) {
      list.push("Loading some data might be heavy please wait");
    }
    return list;
  }, [customTexts, showHeavyMessage]);

  // Rotate text every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % activeTexts.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [activeTexts.length]);

  // Show heavy message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHeavyMessage(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative flex flex-col gap-4 py-4 w-full overflow-hidden ${className}`}>
      {/* The "Rolling Bar" - An indeterminate progress line at the top */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-border-subtle overflow-hidden">
        <motion.div
          className="h-full w-1/3 bg-red"
          animate={{
            x: ["-100%", "300%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            boxShadow: "0 0 8px hsl(var(--red))",
          }}
        />
      </div>

      {/* Skeleton Rows */}
      <div className="flex flex-col gap-2 opacity-40">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-2">
            <Skeleton height={rowHeight} style={{ width: '100%' }} />
          </div>
        ))}
      </div>

      {/* Rotating Subtitle */}
      <div className="flex items-center justify-center min-h-[20px] mt-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={textIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.4 }}
            className="font-mono text-[10px] uppercase tracking-widest text-text-dim text-center"
          >
            {activeTexts[textIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
