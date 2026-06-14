'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReplayFrame, Speed } from "@/types/ui";

export type { Speed };

export const useRaceReplay = (frames: ReplayFrame[]) => {
  const [lap, setLap] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const timer = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timer.current) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!playing || frames.length === 0) {
      stop();
      return;
    }
    const interval = 1000 / speed;
    timer.current = window.setInterval(() => {
      setLap((l) => {
        const next = l + 1;
        if (next > frames.length) {
          setPlaying(false);
          return frames.length;
        }
        return next;
      });
    }, interval);
    return stop;
  }, [playing, speed, frames.length, stop]);

  const frame = frames[lap - 1] ?? null;

  return {
    frame,
    lap,
    totalLaps: frames.length,
    playing,
    speed,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    toggle: () => setPlaying((p) => !p),
    setLap,
    setSpeed,
  };
};
