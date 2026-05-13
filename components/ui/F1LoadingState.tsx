'use client';

import type { FC } from "react";

interface F1LoadingStateProps {
  variant?: string;
  message?: string;
}

export const F1LoadingState: FC<F1LoadingStateProps> = ({ variant = "default" }) => {
  console.log("[loading:replaced] F1LoadingState", { variant });
  return <div className="loading-placeholder" role="status" aria-label={`Loading ${variant}`} />;
};

export default F1LoadingState;
