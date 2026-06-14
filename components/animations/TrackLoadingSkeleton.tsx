'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getCircuitSvgPathandciruitname } from "@/Lib/circuitSvg";

const LOADING_TRACKS = [
  {
    id: "monaco",
    name: "Circuit de Monaco",
    fact: "Monaco is the slowest and hardest circuit to overtake on, requiring absolute precision between the barriers.",
  },
  {
    id: "monza",
    name: "Autodromo Nazionale Monza",
    fact: "Known as the Temple of Speed, cars run at full throttle for over 75% of the lap here.",
  },
  {
    id: "silverstone",
    name: "Silverstone Circuit",
    fact: "Silverstone hosted the first-ever Formula 1 World Championship Grand Prix on May 13, 1950.",
  },
  {
    id: "spa-francorchamps",
    name: "Circuit de Spa-Francorchamps",
    fact: "Spa features the legendary Eau Rouge & Raidillon, a thrilling high-speed uphill sequence.",
  },
  {
    id: "suzuka",
    name: "Suzuka International Racing Course",
    fact: "Designed as a Honda test track in 1962, Suzuka is the only unique 'figure-of-eight' circuit in F1.",
  },
  {
    id: "melbourne",
    name: "Albert Park Circuit",
    fact: "Albert Park is a fast, semi-permanent street circuit wrapping around a beautiful scenic lake.",
  },
  {
    id: "austin",
    name: "Circuit of the Americas (COTA)",
    fact: "COTA features a dramatic 133-foot hill leading into a steep, blind left-hander at Turn 1.",
  },
];

type TrackLoadingSkeletonProps = {
  year?: number;
  className?: string;
  minHeight?: number | string;
};

export function TrackLoadingSkeleton({ year, className = "", minHeight = 350 }: TrackLoadingSkeletonProps) {
  const { isDark } = useAppTheme();
  const theme = isDark ? "dark" : "light";
  const [trackIndex, setTrackIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrackIndex((prev) => (prev + 1) % LOADING_TRACKS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeTrack = LOADING_TRACKS[trackIndex];
  const nameandpath = getCircuitSvgPathandciruitname(activeTrack.id, year ?? new Date().getFullYear(), theme);
  const svg = nameandpath?.url ?? null;

  return (
    <div 
      className={`flex flex-col items-center justify-center py-10 px-4 w-full border border-border-subtle bg-panel-elev relative overflow-hidden ${className}`}
      style={{ minHeight }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTrack.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="flex flex-col items-center justify-center w-full max-w-lg"
        >
          {/* Circuit Outline */}
          <div className="h-44 w-44 flex items-center justify-center mb-6 relative">
            {svg ? (
              <motion.div
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex items-center justify-center"
              >
                <Image
                  src={svg}
                  alt=""
                  aria-hidden
                  width={160}
                  height={160}
                  className="pointer-events-none object-contain h-40 w-40"
                  style={{
                    filter: isDark ? "drop-shadow(0 0 12px rgba(255, 255, 255, 0.15))" : "drop-shadow(0 0 8px rgba(0, 0, 0, 0.05))"
                  }}
                />
              </motion.div>
            ) : (
              <div className="h-28 w-28 border border-dashed border-border animate-pulse" />
            )}
          </div>

          {/* Circuit Name */}
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-text mb-2 text-center"
          >
            {activeTrack.name}
          </motion.h3>

          {/* Fun Fact */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-[11px] font-medium leading-relaxed text-text-dim max-w-sm text-center mb-4 min-h-[32px] px-4"
          >
            &ldquo;{activeTrack.fact}&rdquo;
          </motion.p>
        </motion.div>
      </AnimatePresence>

      {/* Indeterminate Centered Rolling Bar */}
      <div 
        className="w-48 h-[2px] overflow-hidden relative mt-4"
        style={{ backgroundColor: "hsl(var(--border-subtle))" }}
      >
        <motion.div
          className="absolute top-0 left-0 h-full w-1/3 bg-red"
          animate={{
            x: ["-100%", "300%"],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            backgroundColor: "hsl(var(--red))",
            boxShadow: "0 0 8px hsl(var(--red))",
          }}
        />
      </div>
    </div>
  );
}
