"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ThemeMode, ResolvedTheme } from "@/types/theme";
import { DEFAULT_THEME, THEME_STORAGE_KEY, isThemeMode, resolveTheme } from "@/Lib/theme";
import { queryKeys } from "@/Lib/queryKeys";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyResolvedTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  root.classList.toggle("dark", resolved === "dark");
}

export function useTheme() {
  const queryClient = useQueryClient();

  const { data: themeMode = DEFAULT_THEME } = useQuery<ThemeMode>({
    queryKey: queryKeys.theme.root(),
    queryFn: () => {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      return isThemeMode(stored) ? stored : DEFAULT_THEME;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const resolvedTheme = resolveTheme(themeMode, getSystemTheme());

  useEffect(() => {
    applyResolvedTheme(resolvedTheme);
  }, [resolvedTheme]);

  function setTheme(next: ThemeMode) {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    queryClient.setQueryData(queryKeys.theme.root(), next);
    const resolved = resolveTheme(next, getSystemTheme());
    applyResolvedTheme(resolved);
  }

  function toggleTheme() {
    if (themeMode === "system") {
      setTheme(getSystemTheme() === "dark" ? "light" : "dark");
    } else {
      setTheme(themeMode === "dark" ? "light" : "dark");
    }
  }

  return {
    theme: themeMode,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}
