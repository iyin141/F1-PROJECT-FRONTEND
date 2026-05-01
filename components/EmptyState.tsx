'use client';

import { cn } from "@/Lib/utils";

export const EmptyState = ({
  message, description, className,
}: { message: string; description?: string; className?: string }) => (
  <div className={cn("flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-border-subtle rounded-sm", className)}>
    <p className="label-mono mb-2">{message}</p>
    {description && <p className="text-sm text-text-dim max-w-sm">{description}</p>}
  </div>
);

export const ErrorPanel = ({ message = "DATA UNAVAILABLE", onRetry }: { message?: string; onRetry?: () => void }) => (
  <div className="border border-red bg-red/5 rounded-sm px-4 py-3 flex items-center justify-between">
    <span className="label-mono text-red">{message}</span>
    {onRetry && (
      <button onClick={onRetry} className="font-mono text-[10px] uppercase tracking-wider text-red hover:underline">
        {"Retry ->"}
      </button>
    )}
  </div>
);
