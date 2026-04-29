import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getSeasonSchedule,
  getDriverStandings,
  getConstructorStandings,
} from "@/Api_services/season-hub";
import { cacheConfig, queryKeys } from "@/Lib/queryKeys";

export function useSeasonSchedule(year: number) {
  return useQuery({
    queryKey: queryKeys.races.all(year),
    queryFn: () => getSeasonSchedule(year),
    ...cacheConfig.activeSeason,
  });
}

export function useDriverStandings(year: number) {
  return useQuery({
    queryKey: queryKeys.standings.drivers(year),
    queryFn: () => getDriverStandings(year),
    ...cacheConfig.activeSeason,
  });
}

export function useConstructorStandings(year: number) {
  return useQuery({
    queryKey: queryKeys.standings.constructors(year),
    queryFn: () => getConstructorStandings(year),
    ...cacheConfig.activeSeason,
  });
}

// ---------------------------------------------------------------------------
// Theme hook
// Reads/writes the theme stored in the TanStack cache.
// staleTime: Infinity — never refetches. setQueryData is the only way to mutate.
// ---------------------------------------------------------------------------

import type { ThemeMode, ResolvedTheme } from "@/types/theme";
import { DEFAULT_THEME, THEME_STORAGE_KEY, isThemeMode, resolveTheme } from "@/Lib/theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
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

  function setTheme(next: ThemeMode) {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    queryClient.setQueryData(queryKeys.theme.root(), next);
    const resolved = resolveTheme(next, getSystemTheme());
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
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
