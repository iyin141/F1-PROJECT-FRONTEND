import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { NationalityFlag } from "@/_Components/ui/NationalityFlag";
import { TeamMonogram } from "@/_Components/ui/TeamMonogram";
import { DRIVERS, TEAMS } from "@/Lib/data/drivers";
import type { TeamId } from "@/types/ui";
import type { DriverCareerData } from "@/features/driver-record/types/driverRecord.types";

type DriverHeroProps = {
  career?: DriverCareerData;
  driverCode: string;
};

export function DriverHero({ career, driverCode }: DriverHeroProps) {
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const counterRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const staticDriver = DRIVERS.find((d) => d.code === driverCode);
  const teamId: TeamId = staticDriver?.team ?? "red-bull";
  const team = TEAMS[teamId];

  const displayName =
    career?.driverName ??
    (staticDriver
      ? `${staticDriver.firstName} ${staticDriver.lastName}`.trim()
      : driverCode);

  const stats = [
    { label: "CHAMPIONSHIPS", value: career?.championships ?? 0 },
    { label: "WINS", value: career?.totalWins ?? 0 },
    { label: "PODIUMS", value: career?.totalPodiums ?? 0 },
    { label: "POLES", value: "-" },
  ] as const;

  useEffect(() => {
    if (!nameRef.current) return;

    gsap.fromTo(
      nameRef.current,
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
    );

    counterRefs.current.forEach((el, index) => {
      if (!el) return;
      const stat = stats[index];
      if (!stat || typeof stat.value !== "number") return;

      const proxy = { value: 0 };
      gsap.to(proxy, {
        value: stat.value,
        duration: 0.8,
        delay: index * 0.1,
        ease: "power2.out",
        onUpdate: () => {
          if (el) el.textContent = String(Math.round(proxy.value));
        },
      });
    });
  }, [driverCode, career, stats]);

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-border-subtle bg-panel p-4 gap-4">
      <div className="flex items-center gap-4">
        {/* Accent Strip */}
        <div 
          className="h-10 w-1 rounded-sm"
          style={{ backgroundColor: `hsl(var(${team.colorVar}))` }} 
        />
        
        <div className="flex items-center gap-4">
          <span className="font-mono text-xl font-bold tracking-wider text-text w-16">
            {driverCode}
          </span>
          <div className="flex flex-col">
            <span ref={nameRef} className="font-mono text-sm tracking-[0.06em] text-text">
              {displayName}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim">
                {team.name}
              </span>
              <NationalityFlag driverCode={driverCode} nationality={career?.nationality} size={20} className="w-[14px] h-[10px] opacity-80" alt={`${driverCode} nationality`} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full sm:w-auto items-center gap-6 sm:gap-8 pt-4 sm:pt-0 border-t border-border-subtle sm:border-t-0">
        {stats.map((stat, idx) => (
          <div key={stat.label} className="flex flex-col items-start sm:items-end">
            <div className="font-mono text-sm text-white">
              {typeof stat.value === "number" ? (
                <span ref={(el) => {
                  counterRefs.current[idx] = el;
                }}>0</span>
              ) : (
                stat.value
              )}
            </div>
            <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </header>
  );
}
