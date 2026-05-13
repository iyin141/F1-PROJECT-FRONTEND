"use client";

import { useEffect, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { get, set, del } from "idb-keyval";

import { queryKeys } from "@/Lib/queryKeys";
import { DEFAULT_THEME, THEME_STORAGE_KEY, isThemeMode } from "@/Lib/theme";
import { QUERY_PERSIST_BUSTER, QUERY_PERSIST_KEY } from "@/_Stores/queryCache";

function detectInitialTheme() {
  if (typeof window === "undefined") return DEFAULT_THEME;

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(stored) ? stored : DEFAULT_THEME;
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

// Ensure safe SSR
const getPersister = () => {
  if (typeof window === "undefined") {
    return {
      persistClient: async () => {},
      restoreClient: async () => undefined,
      removeClient: async () => {},
    };
  }
  return createAsyncStoragePersister({
    key: QUERY_PERSIST_KEY,
    storage: {
      getItem: async (key) => await get(key),
      setItem: async (key, value) => await set(key, value),
      removeItem: async (key) => await del(key),
    },
  });
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());
  const [persister] = useState(() => getPersister());

  // Seed the theme into the cache once on mount so every component
  // that calls useQuery(queryKeys.theme.root()) gets an immediate value.
  useEffect(() => {
    const initialTheme = detectInitialTheme();
    queryClient.setQueryData(queryKeys.theme.root(), initialTheme);
  }, [queryClient]);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, buster: QUERY_PERSIST_BUSTER }}
    >
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </PersistQueryClientProvider>
  );
}

