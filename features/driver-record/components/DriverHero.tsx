import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { NationalityFlag } from "@/_Components/ui/NationalityFlag";
import { TeamMonogram } from "@/_Components/ui/TeamMonogram";
import { DRIVERS, TEAMS } from "@/Lib/data/drivers";
import { getDriverFlagUrl } from "@/Lib/nationality";
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
  const bgFlag = getDriverFlagUrl(driverCode, 160);

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
  }, [driverCode, career]);

  return (
    <header
      className="relative overflow-hidden rounded-xl border-b border-border-subtle"
      style={{ minHeight: 200, borderLeft: `3px solid hsl(var(${team.colorVar}))` }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "linear-gradient(to right, rgba(17,17,17,0) 0%, rgba(17,17,17,1) 65%)",
            "url('/textures/carbon-fibre.jpg')",
            bgFlag ? `url('${bgFlag}')` : "none",
          ].join(", "),
          backgroundPosition: "center, center, right center",
          backgroundSize: "100% 100%, 400px auto, cover",
          backgroundRepeat: "no-repeat, repeat, no-repeat",
          filter: "none",
        }}
        aria-hidden
      />

      <div className="relative z-10 grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <NationalityFlag driverCode={driverCode} size={40} className="h-7 w-10" alt={`${driverCode} nationality`} />
            <TeamMonogram teamId={teamId} size="md" />
          </div>
          <h1 ref={nameRef} className="font-display text-3xl sm:text-4xl lg:text-5xl leading-none text-text">
            {displayName || driverCode}
          </h1>
          <p className="font-mono text-base tracking-[0.2em] text-text-dim">{driverCode}</p>
          <p className="font-sans text-sm text-text-dim">{team.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div key={stat.label} className="rounded-md border border-border-subtle bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-3 py-2">
              <div className="font-display text-3xl md:text-4xl lg:text-5xl leading-none text-text">
                {typeof stat.value === "number" ? (
                  <span ref={(el) => {
                    counterRefs.current[idx] = el;
                  }}>0</span>
                ) : (
                  stat.value
                )}
              </div>
              <div className="mt-1 font-mono text-[10px] tracking-[0.15em] text-text-dim">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
