"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryKeys } from "@/Lib/queryKeys";
import { DEFAULT_THEME, THEME_STORAGE_KEY, isThemeMode, resolveTheme } from "@/Lib/theme";

function detectInitialTheme() {
  if (typeof window === "undefined") return DEFAULT_THEME;

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(stored) ? stored : DEFAULT_THEME;
}

function applyThemeToDocument(theme: string) {
  const systemDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const resolved = resolveTheme(
    theme as Parameters<typeof resolveTheme>[0],
    systemDark ? "dark" : "light",
  );

  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  // Seed the theme into the cache once on mount so every component
  // that calls useQuery(queryKeys.theme.root()) gets an immediate value.
  useEffect(() => {
    const initialTheme = detectInitialTheme();
    queryClient.setQueryData(queryKeys.theme.root(), initialTheme);
    applyThemeToDocument(initialTheme);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

