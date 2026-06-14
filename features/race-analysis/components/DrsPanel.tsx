'use client';

import { useMemo } from "react";
import Skeleton from "@/components/animations/Skeleton";
import { useDrs } from "@/features/race-detail/hooks/useRaceDetail";
import { driverById } from "@/Lib/data/drivers";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";


export const DrsPanel = ({
  year,
  round,
}: {
  year: number;
  round: number;
}) => {
  const { data, isLoading } = useDrs(year, round);
  const queryClient = useQueryClient();
  const router = useRouter();

  const stats = useMemo(() => {
    if (!data || !data.data || data.data.length === 0) return null;

    const drsEvents = data.data;
    const activations = drsEvents.filter(
      (e: any) => e.drs_activated || e.drs_engaged
    );
    const uniqueDrivers = new Set(
      drsEvents.map((e: any) => e.driver_code || e.driver)
    );
    const totalEvents = drsEvents.length;
    const totalActivations = activations.length;

    // Count activations per driver
    const byDriver = new Map<string, number>();
    for (const event of activations) {
      const driverCode = event.driver_code || event.driver || "Unknown";
      const count = (byDriver.get(driverCode) ?? 0) + 1;
      byDriver.set(driverCode, count);
    }

    // Top 5 users
    const topUsers = Array.from(byDriver.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalEvents,
      totalActivations,
      uniqueDrivers: uniqueDrivers.size,
      topUsers,
    };
  }, [data]);

  if (isLoading) return <Skeleton height={192} />;
  if (!stats) return <div className="text-muted text-sm">No DRS data</div>;

  return (
    <div className="space-y-3">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-border-subtle px-3 py-2">
          <div className="text-[9px] uppercase tracking-[0.1em] text-muted mb-1">
            DRS Activations
          </div>
          <div className="font-mono text-lg font-bold">{stats.totalActivations}</div>
        </div>
        <div className="border border-border-subtle px-3 py-2">
          <div className="text-[9px] uppercase tracking-[0.1em] text-muted mb-1">
            Unique Drivers
          </div>
          <div className="font-mono text-lg font-bold">
            {stats.uniqueDrivers}
          </div>
        </div>
      </div>

      {/* Top DRS users */}
      {stats.topUsers.length > 0 && (
        <div className="border border-border-subtle">
          <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted border-b border-border-subtle">
            Top Users
          </div>
          <div className="space-y-1">
            {stats.topUsers.map(([driverCode, count]) => {
              const driver = driverById(driverCode);
              return (
                <div
                  key={driverCode}
                  className="flex items-center justify-between px-3 py-1.5 font-mono text-sm border-b border-border-subtle last:border-b-0"
                >
                  <span className="font-bold">{driver?.code ?? driverCode}</span>
                  <span className="text-muted" title={`${count} activations`}>
                    {count}x
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
