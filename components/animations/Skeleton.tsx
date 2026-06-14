"use client";

import React from "react";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  width?: number | string;
  height?: number | string;
  variant?: "rect" | "circle" | "text";
};

export default function Skeleton({
  width = "100%",
  height = 16,
  variant = "rect",
  className = "",
  style,
  ...rest
}: SkeletonProps) {
  const computedStyle: React.CSSProperties = { ...(style as React.CSSProperties) };
  if (width !== undefined) computedStyle.width = typeof width === "number" ? `${width}px` : width;
  if (height !== undefined) computedStyle.height = typeof height === "number" ? `${height}px` : height;
  if (variant === "circle") computedStyle.borderRadius = "50%";
  if (variant === "text") computedStyle.borderRadius = "0";

  return <div className={`skeleton ${className}`.trim()} style={computedStyle} aria-hidden {...rest} />;
}

export { Skeleton };
