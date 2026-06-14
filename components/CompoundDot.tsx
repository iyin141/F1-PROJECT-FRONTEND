import { cn } from "@/Lib/utils";
import type { Compound } from "@/types/ui";

const map: Record<Compound, { color: string; letter: string; label: string }> = {
  soft:   { color: "hsl(var(--tyre-soft))",   letter: "S", label: "Soft" },
  medium: { color: "hsl(var(--tyre-medium))", letter: "M", label: "Medium" },
  hard:   { color: "hsl(var(--tyre-hard))",   letter: "H", label: "Hard" },
  inter:  { color: "hsl(var(--tyre-inter))",  letter: "I", label: "Intermediate" },
  wet:    { color: "hsl(var(--tyre-wet))",    letter: "W", label: "Wet" },
};

const UNKNOWN = { color: "hsl(var(--muted))", letter: "?", label: "unknown" };

export const CompoundDot = ({ compound, className }: { compound: Compound | string; className?: string }) => {
  const c = map[(compound as Compound)] ?? UNKNOWN;
  return (
    <span
      title={c.label}
      className={cn("inline-flex items-center justify-center w-[16px] h-[16px] rounded-full text-[9px] font-mono font-bold border", className)}
      style={{ borderColor: c.color, color: c.color }}
    >
      {c.letter}
    </span>
  );
};

export const compoundColor = (c: Compound | string) => (map[(c as Compound)] ?? UNKNOWN).color;
