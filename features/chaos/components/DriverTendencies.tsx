"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { OrbStatus } from "@/components/v2/OrbStatus";
import { api } from "@/Lib/api/v2/client";

const QUICK = ["VER", "NOR", "LEC", "PIA", "HAM", "RUS"];
const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Retirement and pit-stop tendencies with their wide intervals. Never presented as skill. */
export function DriverTendencies() {
  const [code, setCode] = useState("VER");
  const q = useQuery({ queryKey: ["v2", "chaos-driver", code], queryFn: () => api.driverProfile(code), staleTime: Infinity, retry: false });
  const rows = q.data ? Object.entries(q.data.tendencies) : [];
  const max = Math.max(0.2, ...rows.map(([, t]) => t.p90));

  return (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack justify="between" align="center" wrap="wrap" gap={2}>
          <Heading level={2}>Driver tendencies: tendency, not skill</Heading>
          <HStack gap={1.5} wrap="wrap" align="center" role="group" aria-label="Driver">
            {QUICK.map((c) => (
              <Button key={c} label={c} size="sm" variant={c === code ? "secondary" : "ghost"} aria-pressed={c === code} onClick={() => setCode(c)} />
            ))}
            <input
              className="f1-input f1-num"
              aria-label="Driver code"
              placeholder="Code"
              maxLength={3}
              style={{ width: 64 }}
              onKeyDown={(e) => {
                const v = (e.target as HTMLInputElement).value.toUpperCase();
                if (e.key === "Enter" && /^[A-Z]{3}$/.test(v)) setCode(v);
              }}
            />
          </HStack>
        </HStack>
        {q.isError ? (
          <Text color="secondary">No stored history for {code}. {q.error instanceof Error ? q.error.message : ""}</Text>
        ) : !q.data ? (
          <OrbStatus phase="searching" message="Loading the profile" />
        ) : (
          <>
            <Text color="secondary">{q.data.label}</Text>
            <Text className="f1-num" color="secondary">
              {q.data.driver}, {q.data.last_team}, {q.data.races} races, seasons {q.data.seasons[0]} to {q.data.seasons.at(-1)}
            </Text>
            <VStack gap={3}>
              {rows.map(([k, t]) => (
                <VStack gap={0.5} key={k}>
                  <HStack justify="between" wrap="wrap">
                    <Text>{t.label}</Text>
                    <Text className="f1-num">
                      <b>{pct(t.tendency)}</b>{" "}
                      <Text as="span" color="secondary">
                        ({pct(Math.max(0, t.p10))} to {pct(t.p90)}; {t.races_with_event} of {t.races} races)
                      </Text>
                    </Text>
                  </HStack>
                  <svg viewBox="0 0 100 10" width="100%" height="10" preserveAspectRatio="none" role="img" aria-label={`${t.label}: ${pct(t.tendency)}, interval ${pct(t.p10)} to ${pct(t.p90)}`}>
                    <rect width="100" height="10" rx="2" fill="var(--color-background-muted)" />
                    <rect x={(Math.max(0, t.p10) / max) * 100} y="3" width={Math.max(0.8, ((t.p90 - Math.max(0, t.p10)) / max) * 100)} height="4" fill="var(--color-text-secondary)" />
                    <rect x={(t.tendency / max) * 100 - 0.6} width="1.2" height="10" fill="var(--color-text-primary)" />
                  </svg>
                </VStack>
              ))}
            </VStack>
            <Text color="secondary">The bar is the p10 to p90 range and the line is the tendency. A wide bar means few races: read it as unknown, not as a verdict.</Text>
          </>
        )}
      </VStack>
    </Card>
  );
}
