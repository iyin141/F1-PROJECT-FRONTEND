import { useRef, useCallback, useEffect } from "react";

export function useHoverDelay(callback: () => void, delayMs: number = 150) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const onMouseEnter = useCallback(() => {
    clear();
    timeoutRef.current = setTimeout(() => {
      callback();
    }, delayMs);
  }, [callback, delayMs, clear]);

  const onMouseLeave = useCallback(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    return clear;
  }, [clear]);

  return { onMouseEnter, onMouseLeave };
}
