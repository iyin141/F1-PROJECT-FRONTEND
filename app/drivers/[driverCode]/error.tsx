"use client";

export default function Error({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="page-shell w-full">
      <div className="rounded-lg border border-border-subtle bg-surface p-6">
        <h2 className="font-display text-3xl text-text">Driver Record Error</h2>
        <p className="mt-2 font-mono text-xs text-text-dim">Could not load this driver record page.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-text-dim"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
