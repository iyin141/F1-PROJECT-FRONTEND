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
  <section className={cn("w-full min-w-0 overflow-hidden border border-border-subtle bg-panel", className)}>
    {(label || title || action) && (
      <header
        className="flex items-center justify-between border-b border-border-subtle px-4"
        style={{ height: 40, minHeight: 40 }}
      >
        <div className="flex min-w-0 items-center gap-3">
          {label && (
            <span
              className="font-mono text-[11px] uppercase tracking-wide"
              style={{ color: "rgba(255,255,255,0.40)" }}
            >
              {label}
            </span>
          )}
          {title && (
            <span
              className="font-mono text-[11px] uppercase tracking-wide"
              style={{ color: "rgba(255,255,255,0.40)" }}
            >
              {title}
            </span>
          )}
        </div>
        {action && <div className="min-w-0 text-xs">{action}</div>}
      </header>
    )}
    <div className="min-w-0 p-4 sm:p-5">{children}</div>
  </section>
);
