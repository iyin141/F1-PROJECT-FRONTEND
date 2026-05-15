"use client";

import { useMemo, useRef, useEffect } from "react";
import { useNavStore } from "@/_Stores/navStore";
import { gsap } from "gsap";
import { ScrollingCar } from "@/_Components/ScrollingCar";
import { EmptyState } from "@/components/EmptyState";
import { SectionLabel } from "@/_Components/ui/SectionLabel";
import { DRIVERS } from "@/Lib/data/drivers";
import type { TeamId } from "@/types/ui";
import { useDriverCareer, useDriverSeason } from "@/features/driver-record/hooks/useDriverRecord";
import { DriverHero } from "@/features/driver-record/components/DriverHero";
import { CareerTotalsStrip } from "@/features/driver-record/components/CareerTotalsStrip";
import { DataCaveatNote } from "@/features/driver-record/components/DataCaveatNote";
import { CareerTimeline } from "@/features/driver-record/components/CareerTimeline";
import { careerHasIncompleteStats } from "@/features/driver-record/utlis/driverStatHelpers";

type DriverRecordShellProps = {
  driverCode: string;
  year: number;
};

export function DriverRecordShell({ driverCode, year }: DriverRecordShellProps) {
  const setDriverYear = useNavStore((s) => s.setDriverYear);
  const storeDriverYear = useNavStore((s) => s.driverYear);

  const selectedYear = storeDriverYear ?? year;
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const code = driverCode.toUpperCase();
  const career = useDriverCareer(code);
  const season = useDriverSeason(code, selectedYear);

  const seasons = useMemo(
    () => [...(career.data?.seasons ?? [])].sort((a, b) => b.year - a.year),
    [career.data?.seasons],
  );

  useEffect(() => {
    setDriverYear(year);
  }, [year, setDriverYear]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const rule = sectionRef.current.querySelector("span[aria-hidden]");
    if (!rule) return;

    gsap.fromTo(rule, { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: 0.6, ease: "power2.out" });
  }, [seasons.length]);

  const staticDriver = DRIVERS.find((d) => d.code === code);
  const teamId: TeamId = staticDriver?.team ?? "red-bull";

  return (
    <main className="page-shell w-full space-y-6 pb-10">
      <ScrollingCar />
      <DriverHero driverCode={code} career={career.data} />

      <CareerTotalsStrip
        seasons={seasons}
        totals={career.data ? { totalWins: career.data.totalWins, totalPodiums: career.data.totalPodiums, championships: career.data.championships } : undefined}
      />

      <div ref={sectionRef}>
        <SectionLabel>CAREER</SectionLabel>
      </div>

      {!career.isLoading && careerHasIncompleteStats(seasons) && <DataCaveatNote />}

      {seasons.length === 0 ? (
        <EmptyState message="No career data" description={`No career history found for ${code}.`} />
      ) : (
        <CareerTimeline
          seasons={seasons}
          selectedYear={selectedYear}
          teamId={teamId}
          onSelectYear={(nextYear) => {
              if (nextYear) {
                setDriverYear(nextYear);
                window.history.replaceState(null, "", `/drivers/${code}/${nextYear}`);
            }
          }}
          seasonData={season.data}
          seasonLoading={season.isLoading}
          seasonError={season.isError}
          onRetrySeason={() => {
            void season.refetch();
          }}
        />
      )}
    </main>
  );
}
