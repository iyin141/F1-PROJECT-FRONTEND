import { cn } from "@/Lib/utils";
import type { ReactNode } from "react";

interface PanelProps {
  label?: string;
  title?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export const Panel = ({ label, title, action, className, children }: PanelProps) => (
  <section className={cn("w-full min-w-0 overflow-hidden rounded-sm border border-border-subtle bg-panel", className)}>
    {(label || title || action) && (
      <header className="flex flex-col gap-3 border-b border-border-subtle px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-baseline gap-3">
          {label && <span className="label-mono">{label}</span>}
          {title && <h2 className="font-display text-sm font-semibold tracking-tight text-text">{title}</h2>}
        </div>
        {action && <div className="min-w-0 text-xs">{action}</div>}
      </header>
    )}
    <div className="min-w-0 p-4 sm:p-5">{children}</div>
  </section>
);
