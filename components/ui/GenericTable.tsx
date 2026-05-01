'use client';

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/Lib/utils";
import type { ColumnDef, RowVariant } from "@/types/ui";

export type { ColumnDef, RowVariant };

type VariantConfig = {
  className?: string;
  style?: CSSProperties;
};

const VARIANT_CONFIG: Record<RowVariant, VariantConfig> = {
  default: {},
  fastlap: { style: { backgroundColor: "color-mix(in srgb, #a855f7 12%, transparent)" } },
  pole: { style: { backgroundColor: "color-mix(in srgb, hsl(var(--amber)) 16%, transparent)" } },
  pit: { style: { backgroundColor: "color-mix(in srgb, hsl(var(--amber)) 8%, transparent)" } },
  dnf: { className: "opacity-60" },
  "safety-car": { style: { backgroundColor: "color-mix(in srgb, hsl(var(--amber)) 6%, transparent)" } },
};

const VARIANT_BADGE: Partial<Record<RowVariant, ReactNode>> = {
  fastlap: (
    <span
      className="rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.15em]"
      style={{
        backgroundColor: "color-mix(in srgb, #a855f7 25%, transparent)",
        color: "#a855f7",
      }}
    >
      FL
    </span>
  ),
  pole: (
    <span
      className="rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.15em]"
      style={{
        backgroundColor: "color-mix(in srgb, hsl(var(--amber)) 30%, transparent)",
        color: "hsl(var(--amber))",
      }}
    >
      POLE
    </span>
  ),
};

const alignClass = (align?: "left" | "right" | "center") => {
  if (align === "right") return "justify-end text-right";
  if (align === "center") return "justify-center text-center";
  return "justify-start text-left";
};

type GenericTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  getRowKey: (row: T, idx: number) => string;
  onRowClick?: (row: T, idx: number) => void;
  getRowVariant?: (row: T, idx: number) => RowVariant;
  getRowStyle?: (row: T, idx: number) => CSSProperties;
  getRowClassName?: (row: T, idx: number) => string;
  renderRowFooter?: (row: T, idx: number) => ReactNode;
  className?: string;
  rowClassName?: string;
  showHeaders?: boolean;
  striped?: boolean;
};

export function GenericTable<T>({
  columns,
  data,
  getRowKey,
  onRowClick,
  getRowVariant,
  getRowStyle,
  getRowClassName,
  renderRowFooter,
  className,
  rowClassName,
  showHeaders = true,
  striped = false,
}: GenericTableProps<T>) {
  type DisplayColumn = {
    key: string;
    width: string;
    header?: ReactNode;
    align?: "left" | "right" | "center";
    headerClassName?: string;
    cellClassName?: string;
  };

  const hasVariantBadgeColumn = data.some((row, idx) => {
    const variant = getRowVariant?.(row, idx) ?? "default";
    return Boolean(VARIANT_BADGE[variant]);
  });

  const displayColumns: DisplayColumn[] = hasVariantBadgeColumn
    ? [...columns, { key: "__variant_badge__", width: "44px", align: "right" as const, header: " " }]
    : columns;

  const gridStyle: CSSProperties = {
    gridTemplateColumns: displayColumns.map(column => column.width).join(" "),
  };

  return (
    <div className={cn("overflow-hidden rounded-[2px] border border-border-subtle bg-panel", className)}>
      {showHeaders && (
        <div
          className="grid items-center border-b border-border-subtle bg-panel-elev px-3 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim"
          style={gridStyle}
        >
          {displayColumns.map(column => (
            <span key={column.key} className={cn("flex items-center", alignClass(column.align), column.headerClassName)}>
              {column.header ?? null}
            </span>
          ))}
        </div>
      )}

      {data.map((row, idx) => {
        const variant = getRowVariant?.(row, idx) ?? "default";
        const variantCfg = VARIANT_CONFIG[variant];
        const variantBadge = VARIANT_BADGE[variant];

        const rowStyle: CSSProperties = {
          ...gridStyle,
          ...variantCfg.style,
          ...getRowStyle?.(row, idx),
        };

        return (
          <div key={getRowKey(row, idx)}>
            <div
              className={cn(
                "grid items-center border-b border-border-subtle/50 bg-bg px-3 py-2.5",
                "transition-colors hover:bg-panel-elev/70",
                onRowClick && "cursor-pointer",
                striped && idx % 2 === 1 && "bg-panel/60",
                variantCfg.className,
                rowClassName,
                getRowClassName?.(row, idx)
              )}
              style={rowStyle}
              onClick={onRowClick ? () => onRowClick(row, idx) : undefined}
            >
              {columns.map(column => (
                <div key={column.key} className={cn("flex items-center gap-5", alignClass(column.align), column.cellClassName)}>
                  {column.render(row, idx)}
                </div>
              ))}

              {hasVariantBadgeColumn && (
                <div className="flex items-center justify-end">
                  {variantBadge ?? null}
                </div>
              )}
            </div>
            {renderRowFooter && <div>{renderRowFooter(row, idx)}</div>}
          </div>
        );
      })}
    </div>
  );
}
