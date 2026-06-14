'use client';

import { cn } from "@/Lib/utils";

export const EmptyState = ({
  message, description, className,
}: { message: string; description?: string; className?: string }) => (
  <div className={cn("flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-border-subtle bg-surface", className)}>
    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-dim mb-2">{message}</p>
    {description && <p className="font-sans text-sm text-muted max-w-sm">{description}</p>}
  </div>
);

export const ErrorPanel = ({ message = "DATA UNAVAILABLE", onRetry }: { message?: string; onRetry?: () => void }) => (
  <div className="border border-red bg-panel px-4 py-3 flex items-center justify-between">
    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-red">{message}</span>
    {onRetry && (
      <button onClick={onRetry} className="font-mono text-[10px] uppercase tracking-[0.2em] text-red hover:underline transition-all">
        [ RETRY ]
      </button>
    )}
  </div>
);
