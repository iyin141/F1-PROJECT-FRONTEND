"use client";

import { useAppTheme } from "@/hooks/useAppTheme";

export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, toggle } = useAppTheme();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        borderRadius: "4px",
        border: "1px solid hsl(var(--border-subtle))",
        backgroundColor: "transparent",
        color: "hsl(var(--muted))",
        cursor: "pointer",
        transition: "color 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "hsl(var(--text))";
        e.currentTarget.style.borderColor = "hsl(var(--border))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "hsl(var(--muted))";
        e.currentTarget.style.borderColor = "hsl(var(--border-subtle))";
      }}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}
