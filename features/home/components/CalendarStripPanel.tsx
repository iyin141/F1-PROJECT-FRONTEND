'use client';

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getRaceResultsBridged } from "@/Lib/api/bridged";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Panel } from "@/components/Panel";
import { getCircuitSvgPathandciruitname } from "@/Lib/circuitSvg";
import type { Race } from "@/types/ui";


type CalendarStripPanelProps = {
  calendar: Race[] | undefined;
  loading: boolean;
  year?: number;
};

export const CalendarStripPanel = ({ calendar, loading, year }: CalendarStripPanelProps) => {
  const { isDark } = useAppTheme();
  const theme = isDark ? "dark" : "light";
  const router = useRouter();
  const queryClient = useQueryClient();
  void loading;

  return (
    <Panel label="CALENDAR" title={`Season ${year ?? new Date().getFullYear()}`} className="mt-6">
      <div className="grid grid-cols-3 gap-2">
          {calendar?.map((r) => {
            const nameandpath = getCircuitSvgPathandciruitname(r.circuit.id, r.year, theme);


            const svg = nameandpath?.url ?? null;
            const name = nameandpath?.entry?.name;






            return (
              <Link
                key={r.round}
                href={`/race/${r.year}/${r.round}`}
                onMouseEnter={() => {
                  router.prefetch(`/race/${r.year}/${r.round}`);
                  void getRaceResultsBridged(queryClient, r.year, r.round);
                }}
                className={`relative flex min-h-42 flex-col justify-between overflow-hidden rounded-sm border px-3 py-3 font-mono text-[11px] transition-colors
                 border-border-subtle text-text-dim hover:border-border hover:text-text`}
              >
                {/* circuit outline watermark — bottom right */}
                {svg && (
                  <Image
                    src={svg}
                    alt=""
                    aria-hidden
                    width={124}
                    height={124}
                    className="pointer-events-none absolute bottom-1 right-1 h-[7.7rem] w-[7.7rem] object-contain"
                    style={{ opacity: 0.4 }}
                  />
                )}

                {/* country flag — top right */}
                <Image
                  src={`https://flagcdn.com/w40/${r.circuit.countryCode.toLowerCase()}.png`}
                  alt={r.circuit.country}
                  width={22}
                  height={14}
                  className="absolute right-2 top-2 rounded-xs object-cover opacity-80 w-auto h-auto"
                />

                {/* round number */}
                <div
                  className="text-[10px] tracking-[0.15em]"
                  style={{ color: "hsl(var(--muted))" }}
                >
                  R{String(r.round).padStart(2, "0")}
                </div>

                {/* race short name */}
                <div
                  className="relative z-10 mt-9 pr-9 font-semibold tracking-[0.08em]"
                  title={r.shortName}
                >
                  {r.shortName}
                </div>

                {/* circuit name */}
                <div className="relative z-10 pr-[calc(7.7rem+2px)]">
                  <div
                    className="mt-0.5 truncate text-[9px] uppercase tracking-[0.15em]"
                    style={{ color: "hsl(var(--muted))" }}
                    title={name}
                  >
                    {name}
                  </div>

                  {/* date */}
                  <div
                    className="mt-2 text-[9px] uppercase tracking-[0.2em]"
                    style={{ color: "hsl(var(--muted))" }}
                  >
                    {new Date(r.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
              </Link>
            );
          })}
      </div>
    </Panel>
  );
};
