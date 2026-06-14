'use client';

import { useCallback, useRef, useState } from "react";

export function useResizeObserver<T extends HTMLElement>() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const roRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((el: T | null) => {
    roRef.current?.disconnect();
    roRef.current = null;
    if (!el) return;
    roRef.current = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    roRef.current.observe(el);
  }, []);

  return { ref, size };
}
