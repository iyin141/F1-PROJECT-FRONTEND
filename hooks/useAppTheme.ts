"use client";

import { useTheme } from "next-themes";

export function useAppTheme() {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme !== "light";

  function toggle() {
    setTheme(isDark ? "light" : "dark");
  }

  return { isDark, resolvedTheme, toggle, setTheme };
}
