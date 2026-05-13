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
      { y: 8, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.2,
        stagger: 0.02,
        ease: "power1.out",
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [seasons]);

  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface">
      <table className="w-full min-w-3xl border-collapse">
        <thead>
          <tr className="border-b border-border-subtle font-mono text-[10px] tracking-[0.15em] text-text-dim">
            <th className="w-0.75 p-0" />
            <th className="px-3 py-2 text-left">YEAR</th>
            <th className="px-2 py-2 text-right">W</th>
            <th className="px-2 py-2 text-right">POD</th>
            <th className="px-2 py-2 text-right">POLE</th>
            <th className="hidden px-2 py-2 text-right lg:table-cell">FL</th>
            <th className="px-2 py-2 text-right">RACES</th>
            <th className="px-2 py-2 text-right">TITLE</th>
          </tr>
        </thead>
        <tbody ref={bodyRef}>
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
                <tr>
                  <td colSpan={8} className="p-0">
                    {selected && (
                      <SeasonBreakdown
                        year={selectedYear}
                        season={seasonData}
                        loading={seasonLoading}
                        isError={seasonError}
                        onRetry={onRetrySeason}
                        onClose={() => onSelectYear(null)}
                      />
                    )}
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
