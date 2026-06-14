import { Fragment, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CareerSeason, DriverSeasonData } from "@/features/driver-record/types/driverRecord.types";
import type { TeamId } from "@/types/ui";
import { CareerRow } from "@/features/driver-record/components/CareerRow";
import { SeasonBreakdown } from "@/features/driver-record/components/SeasonBreakdown";

gsap.registerPlugin(ScrollTrigger);

type CareerTimelineProps = {
  seasons: CareerSeason[];
  selectedYear: number | null;
  teamId: TeamId;
  onSelectYear: (year: number | null) => void;
  seasonData?: DriverSeasonData;
  seasonLoading: boolean;
  seasonError: boolean;
  onRetrySeason: () => void;
};

export function CareerTimeline({
  seasons,
  selectedYear,
  teamId,
  onSelectYear,
  seasonData,
  seasonLoading,
  seasonError,
  onRetrySeason,
}: CareerTimelineProps) {
  const bodyRef = useRef<HTMLTableSectionElement | null>(null);

  useEffect(() => {
    const container = bodyRef.current;
    if (!container) return;

    const rows = Array.from(container.querySelectorAll("tr[data-career-row='true']"));
    if (!rows.length) return;

    const tween = gsap.fromTo(
      rows,
      { y: 4, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.15,
        stagger: 0.015,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container,
          start: "top 90%",
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [seasons]);

  return (
    <div className="overflow-x-auto bg-[#0A0A0F] pb-12">
      <table className="w-full min-w-3xl border-collapse text-left">
        <thead>
          <tr className="border-b border-border-subtle font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
            <th className="w-0.5 p-0" />
            <th className="px-4 py-3">YEAR</th>
            <th className="px-3 py-3 text-right">W</th>
            <th className="px-3 py-3 text-right">POD</th>
            <th className="px-3 py-3 text-right">POLE</th>
            <th className="hidden px-3 py-3 text-right lg:table-cell">FL</th>
            <th className="px-3 py-3 text-right">RACES</th>
            <th className="px-4 py-3 text-right">TITLE</th>
          </tr>
        </thead>
        <tbody ref={bodyRef} className="divide-y divide-white/5">
          {seasons.map((season) => {
            const selected = selectedYear === season.year;
            return (
              <Fragment key={season.year}>
                <CareerRow
                  season={season}
                  selected={selected}
                  teamId={teamId}
                  onSelect={(year) => onSelectYear(selected ? null : year)}
                />
                {selected && (
                  <tr>
                    <td colSpan={8} className="p-0 border-b border-border-subtle pb-6 bg-[#0A0A0F]">
                      <SeasonBreakdown
                        year={selectedYear}
                        season={seasonData}
                        loading={seasonLoading}
                        isError={seasonError}
                        onRetry={onRetrySeason}
                        onClose={() => onSelectYear(null)}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
