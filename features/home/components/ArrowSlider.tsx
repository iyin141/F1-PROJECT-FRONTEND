'use client';

import { ChevronLeft, ChevronRight } from "lucide-react";

type ArrowSliderProps = {
  label: string;
  value: string;
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  disabled?: boolean;
};

export const ArrowSlider = ({
  label,
  value,
  onPrev,
  onNext,
  prevDisabled = false,
  nextDisabled = false,
  disabled = false,
}: ArrowSliderProps) => {
  return (
    <div className="flex items-center gap-2 rounded-sm border border-border-subtle bg-panel px-2 py-1.5">
      <span className="label-mono whitespace-nowrap">{label}</span>
      <button
        type="button"
        onClick={onPrev}
        disabled={disabled || prevDisabled}
        className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-border-subtle text-text transition-colors hover:bg-surface2 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={`Previous ${label.toLowerCase()}`}
      >
        <ChevronLeft size={14} />
      </button>
      <span className="min-w-28 text-center font-mono text-xs uppercase tracking-[0.12em] text-text">
        {value}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled || nextDisabled}
        className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-border-subtle text-text transition-colors hover:bg-surface2 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={`Next ${label.toLowerCase()}`}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
};
