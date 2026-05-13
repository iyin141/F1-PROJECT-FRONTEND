import type { HTMLAttributes } from "react";

type SkeletonCardProps = HTMLAttributes<HTMLDivElement>;

export function SkeletonCard({ className, ...props }: SkeletonCardProps) {
  return (
    <div
      className={["animate-pulse rounded-md bg-surface2", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
