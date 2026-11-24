import { Heading } from "@astryxdesign/core/Heading";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

type Props = { params: Promise<{ year: string; round: string }>; searchParams: Promise<Record<string, string | undefined>> };

/** Placeholder for the telemetry lab (phase U1c). Shows what the race hub handed over. */
export default async function TelemetryLabPage({ params, searchParams }: Props) {
  const { year, round } = await params;
  const q = await searchParams;
  return (
    <VStack gap={3} padding={6} style={{ maxWidth: 720, margin: "0 auto" }}>
      <Heading level={1}>Telemetry lab</Heading>
      <Text>Coming in the next phase. Request received for {year} round {round}:</Text>
      <Text className="f1-num" data-testid="lab-params">
        drivers={q.drivers ?? "-"} lap={q.lap ?? "-"} start_m={q.start_m ?? "-"} end_m={q.end_m ?? "-"}
      </Text>
      <Link href={`/race/${year}/${round}`}>Back to the race hub</Link>
    </VStack>
  );
}
