"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { del } from "idb-keyval";

import { QUERY_PERSIST_KEY } from "@/_Stores/queryCache";

export function ClearCacheButton({ className }: { className?: string }) {
  const queryClient = useQueryClient();
  const [isClearing, setIsClearing] = useState(false);
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");

  async function clearAllCaches() {
    try {
      setIsClearing(true);
      setStatus("idle");

      await queryClient.cancelQueries();
      queryClient.clear();
      await del(QUERY_PERSIST_KEY);

      if (typeof window !== "undefined" && "caches" in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.map((name) => window.caches.delete(name)));
      }

      setStatus("done");
    } catch {
      setStatus("error");
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={clearAllCaches}
        disabled={isClearing}
        className={
          className ??
          "rounded-sm border border-border-subtle px-3 py-1 text-xs font-mono text-muted transition-colors hover:border-border hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {isClearing ? "Clearing..." : "Clear Cache"}
      </button>
      {status === "done" && <span className="text-[10px] font-mono text-green-400">cleared</span>}
      {status === "error" && <span className="text-[10px] font-mono text-red-400">failed</span>}
    </div>
  );
}
