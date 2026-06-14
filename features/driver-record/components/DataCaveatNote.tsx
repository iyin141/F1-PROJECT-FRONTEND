export function DataCaveatNote() {
  return (
    <div className="flex items-center gap-3 border border-[hsl(var(--amber)_/_0.3)] bg-[hsl(var(--amber)_/_0.05)] px-4 py-3 mb-6">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--amber))]">
        [ NOTE ]
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
        PODIUMS, POLES AND FASTEST LAPS UPDATE AS RACE DATA IS PERSISTED
      </span>
    </div>
  );
}
