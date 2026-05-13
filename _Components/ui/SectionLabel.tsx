import type { ReactNode } from "react";

type SectionLabelProps = {
  children: ReactNode;
  className?: string;
};

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div className={["flex items-center gap-3", className].filter(Boolean).join(" ")}>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim">{children}</span>
      <span className="h-px flex-1 bg-border-subtle" aria-hidden />
    </div>
  );
}
