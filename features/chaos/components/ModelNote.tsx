import { Badge } from "@astryxdesign/core/Badge";
import { Banner } from "@astryxdesign/core/Banner";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import type { ChaosModelBlock } from "@/Lib/api/v2/payloads";

const NAMES: Record<string, string> = {
  kumo_tabular_calibrated: "Kumo Tabular, calibrated",
  kumo_tabular: "Kumo Tabular, raw",
  beta_binomial: "Baseline (Beta-Binomial)",
};

/** Which model produced the numbers, exactly as the API says, with the fallback flag and calibration state. Never hidden. */
export function ModelNote({ model }: { model: ChaosModelBlock }) {
  const uncalibrated = model.model === "kumo_tabular_calibrated" && !model.calibrated;
  return (
    <VStack gap={2}>
      <HStack gap={2} wrap="wrap" align="center">
        <Badge label={NAMES[model.model] ?? model.model} variant="neutral" />
        {model.is_fallback ? <Badge label="Fallback: baseline served" variant="warning" /> : null}
        <Text color="secondary" className="f1-num">
          Run {model.run_id}, {model.context_rows.toLocaleString("en-GB")} training rows, updated {model.updated.slice(0, 10)}
        </Text>
      </HStack>
      <Text color="secondary">Calibration: {model.calibration}. {model.selected_by}. Interval: {model.interval}.</Text>
      {model.is_fallback && model.fallback_reason ? <Banner status="warning" title="Baseline numbers" description={model.fallback_reason} /> : null}
      {uncalibrated ? (
        <Banner status="info" title="Not calibrated yet" description="These probabilities are the raw Kumo output because there is too little backtest history to calibrate them. Read them as rankings, not exact odds." />
      ) : null}
    </VStack>
  );
}
