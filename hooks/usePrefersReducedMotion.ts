"use client";

import { useEffect, useState } from "react";

export default function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReduced(query.matches);
    update();
    try {
      query.addEventListener("change", update);
      return () => query.removeEventListener("change", update);
    } catch {
      // Safari fallback
      query.addListener(update);
      return () => query.removeListener(update);
    }
  }, []);

  return prefersReduced;
}

export { usePrefersReducedMotion };
