"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Banner } from "@astryxdesign/core/Banner";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { OrbStatus } from "@/components/v2/OrbStatus";
import { v2Queries } from "@/Lib/api/v2/queries";
import type { ModelCell, ModelPage } from "@/Lib/api/v2/payloads";
import { Echart, useChartColours } from "@/features/race-hub/components/Echart";

const TARGET_LABEL: Record<string, string> = {
  sc_vsc_red: "safety car, VSC or red flag", dnf_mechanical: "mechanical DNF", dnf_incident: "incident DNF", slow_stop: "slow pit stop", unlucky_stop: "unlucky stop",
};
const SCOPE_LABEL: Record<string, string> = { race: "Race", driver: "Driver", lap_window: "Lap window" };
const MODEL_LABEL: Record<string, string> = { beta_binomial: "Baseline (Beta-Binomial)", lightgbm: "LightGBM", kumo: "Kumo Tabular" };
const BASELINE = "beta_binomial";

const cellLabel = (k: string) => {
  const [scope, target] = k.split("|");
  return `${SCOPE_LABEL[scope] ?? scope}: ${TARGET_LABEL[target] ?? target}`;
};
const f = (v: number | null | undefined, d = 3) => (v === null || v === undefined ? "n/a" : v.toFixed(d));

function Calibration({ results, cell }: { results: NonNullable<ModelPage["backtest"]>["results"]; cell: string }) {
  const c = useChartColours();
  const palette = [c.ink, "#E69F00", "#56B4E9"];
  const option = useMemo(() => {
    const models = Object.keys(results).filter((m) => results[m][cell]?.bins?.length);
    return {
      grid: { left: 48, right: 16, top: 72, bottom: 40 },
      legend: { top: 0, textStyle: { color: c.muted } },
      tooltip: { trigger: "item", formatter: (p: { seriesName: string; data: number[] }) => `${p.seriesName}: predicted ${(p.data[0] * 100).toFixed(0)}%, observed ${(p.data[1] * 100).toFixed(0)}%` },
      xAxis: { type: "value", min: 0, max: 1, name: "Predicted probability", nameLocation: "middle", nameGap: 26, axisLabel: { color: c.muted, formatter: (v: number) => `${Math.round(v * 100)}%` }, splitLine: { lineStyle: { color: c.grid } } },
      yAxis: { type: "value", min: 0, max: 1, name: "Observed rate", nameLocation: "middle", nameGap: 36, axisLabel: { color: c.muted, formatter: (v: number) => `${Math.round(v * 100)}%` }, splitLine: { lineStyle: { color: c.grid } } },
      series: [
        { type: "line", name: "Perfect calibration", data: [[0, 0], [1, 1]], showSymbol: false, lineStyle: { color: c.muted, type: "dashed", width: 1 }, silent: true },
        ...models.map((m, i) => ({
          type: "line", name: MODEL_LABEL[m] ?? m, symbolSize: 7, lineStyle: { color: palette[i % 3], width: 2 }, itemStyle: { color: palette[i % 3] },
          data: results[m][cell].bins!.map((b) => [b.mean_pred, b.frac_pos, b.n]),
        })),
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, cell, c.ink, c.muted, c.grid]);
  return <Echart option={option} height={340} label="Reliability diagram: predicted probability against observed rate, one line per model" />;
}

type PerSeason = NonNullable<NonNullable<ModelPage["backtest"]>["per_season"]>;

/** Brier or log-loss by held-out season, one line per model: shows whether a model's edge holds every year or just pooled. */
function PerSeasonChart({ perSeason, cell }: { perSeason: PerSeason; cell: string }) {
  const c = useChartColours();
  const [metric, setMetric] = useState<"brier" | "log_loss">("brier");
  const palette = [c.ink, "#E69F00", "#56B4E9"];
  const models = Object.keys(perSeason).filter((m) => perSeason[m][cell]);
  const seasons = [...new Set(models.flatMap((m) => Object.keys(perSeason[m][cell])))].sort();
  const option = useMemo(() => ({
    grid: { left: 52, right: 16, top: 56, bottom: 32 },
    legend: { top: 0, textStyle: { color: c.muted } },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: seasons, axisLabel: { color: c.muted } },
    yAxis: { type: "value", scale: true, name: metric === "brier" ? "Brier (lower is better)" : "Log-loss (lower is better)", nameTextStyle: { color: c.muted, align: "left" }, axisLabel: { color: c.muted }, splitLine: { lineStyle: { color: c.grid } } },
    series: models.map((m, i) => ({
      type: "line", name: MODEL_LABEL[m] ?? m, symbolSize: 6, lineStyle: { color: palette[i % 3], width: 2 }, itemStyle: { color: palette[i % 3] },
      data: seasons.map((y) => perSeason[m][cell][y]?.[metric] ?? null),
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [perSeason, cell, metric, c.ink, c.muted, c.grid]);
  if (!models.length) return null;
  return (
    <VStack gap={2}>
      <Text weight="semibold">By held-out season</Text>
      <SegmentedControl label="Metric" value={metric} onChange={(v) => setMetric(v as "brier" | "log_loss")} size="sm">
        <SegmentedControlItem value="brier" label="Brier" />
        <SegmentedControlItem value="log_loss" label="Log-loss" />
      </SegmentedControl>
      <Echart option={option} height={280} label={`${metric === "brier" ? "Brier score" : "Log-loss"} by held-out season, one line per model`} />
    </VStack>
  );
}

function Metrics({ results, cell }: { results: NonNullable<ModelPage["backtest"]>["results"]; cell: string }) {
  const rows = Object.keys(results).filter((m) => results[m][cell]);
  const base: ModelCell | undefined = results[BASELINE]?.[cell];
  const delta = (v: number, b: number | undefined) => (b === undefined ? "" : ` (${v - b <= 0 ? "" : "+"}${(v - b).toFixed(3)} vs baseline)`);
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="f1-table">
        <thead><tr><th>Model</th><th>Brier (lower is better)</th><th>Log-loss (lower is better)</th><th>AUC</th><th>ECE</th><th>Samples</th></tr></thead>
        <tbody>
          {rows.map((m) => {
            const r = results[m][cell];
            return (
              <tr key={m}>
                <td>{MODEL_LABEL[m] ?? m}</td>
                <td>{f(r.brier)}{m !== BASELINE ? delta(r.brier, base?.brier) : ""}</td>
                <td>{f(r.log_loss)}{m !== BASELINE ? delta(r.log_loss, base?.log_loss) : ""}</td>
                <td>{f(r.auc, 2)}</td><td>{f(r.ece)}</td><td>{r.n.toLocaleString("en-GB")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const CARD: { title: string; body: string[] }[] = [
  { title: "Data", body: ["Race results and session timing from FastF1 and Jolpica, stored in our own database. Each retirement status is mapped to a group (engine, gearbox, hydraulics, electrical and brakes count as mechanical; accident and collision count as incident). Safety car, virtual safety car and red-flag periods come from race control messages. Slow and unlucky pit stops use pit-lane time against the season's 90th percentile."] },
  { title: "Features", body: ["History-based: rates for the circuit, circuit type, team and driver, shrunk toward the field average with a Beta-Binomial prior, plus circuit traits (wall proximity, overtaking index, length). Nothing from the race itself is used for a pre-race prediction. A regulation-era flag marks 2022 onwards."] },
  { title: "Models", body: ["Baseline: the Beta-Binomial rates above, with 10th and 90th percentile intervals. Kumo Tabular: a pretrained tabular model fitted on the same features, then calibrated with isotonic regression on earlier races when enough history exists; otherwise the calibration is the identity and the response says so. LightGBM appears only in the backtest as a reference."] },
  { title: "Limitations", body: ["Probabilities describe events, not people: driver and pit-stop numbers are tendencies with wide intervals, not skill ratings. Samples are small, so intervals matter more than point values. Pit-lane time depends on the circuit, so the slow-stop label is noisy. Seasons before 2022 used different cars. Calibration needs a backtest backfill that has to be run on the server; until then it can be identity and is flagged."] },
  { title: "Changelog", body: ["Labels and baseline: first release.", "Kumo Tabular and isotonic calibration: first release, off until the server backfill has run.", "Leave-one-season-out backtest: first release; the API serves pooled metrics."] },
];

export function ModelPageView() {
  const q = useQuery(v2Queries.chaosModel());
  const bt = q.data?.backtest ?? null;
  const cells = useMemo(() => (bt ? [...new Set(Object.values(bt.results).flatMap((r) => Object.keys(r)))] : []), [bt]);
  const [pick, setPick] = useState<string | null>(null);
  const cell = pick && cells.includes(pick) ? pick : cells[0];
  const identity = q.data?.current_runs.some((r) => r.calibration?.startsWith("identity") || r.calibrated === false);

  return (
    <VStack gap={4}>
      {q.isError ? <Text color="secondary">The model page could not be loaded.</Text> : !q.data ? <OrbStatus phase="searching" message="Loading model runs" /> : (
        <>
          <Card padding={4}>
            <VStack gap={3}>
              <Heading level={2}>Current runs</Heading>
              {q.data.current_runs.length === 0 ? (
                <Banner status="info" title="No model has run yet" description="Chaos predictions appear after the first pipeline run on the server." />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="f1-table">
                    <thead><tr><th>Model</th><th>Size</th><th>Training rows</th><th>Calibration</th><th>Updated</th></tr></thead>
                    <tbody>
                      {q.data.current_runs.map((r) => (
                        <tr key={r.id}><td>{r.model}</td><td>{r.size}</td><td>{r.context_rows.toLocaleString("en-GB")}</td><td>{r.calibration ?? "none"}</td><td>{r.updated.slice(0, 10)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {identity ? <Banner status="info" title="Calibration is not fitted yet" description="There is too little backtest history, so calibration is the identity: probabilities are the raw model output. Rankings are meaningful; exact percentages are not yet." /> : null}
            </VStack>
          </Card>

          <Card padding={4}>
            <VStack gap={3}>
              <Heading level={2}>Calibration and accuracy</Heading>
              {!bt ? (
                <Banner status="warning" title="No backtest has run yet" description="Accuracy against the baseline is shown once the leave-one-season-out backtest has run on the server. Until then there is nothing to plot, and the numbers elsewhere should be read with that in mind." />
              ) : (
                <>
                  <Text color="secondary" className="f1-num">
                    Leave-one-season-out over {bt.seasons[0]} to {bt.seasons.at(-1)}, {bt.races} races. {bt.note}
                  </Text>
                  {bt.per_season ? null : <Text color="secondary">This response has no per-season split, so metrics are pooled over all seasons.</Text>}
                  <SegmentedControl label="Prediction" value={cell ?? ""} onChange={setPick} size="sm">
                    {cells.map((c) => <SegmentedControlItem key={c} value={c} label={cellLabel(c)} />)}
                  </SegmentedControl>
                  {cell ? (
                    <>
                      <Calibration results={bt.results} cell={cell} />
                      <Text color="secondary">Points on the dashed line mean a predicted 30% happens about 30% of the time. Below the line the model is overconfident.</Text>
                      <Metrics results={bt.results} cell={cell} />
                      {bt.per_season ? <PerSeasonChart perSeason={bt.per_season} cell={cell} /> : null}
                      {bt.skipped_models?.length ? <Text color="secondary">Skipped models: {bt.skipped_models.join(", ")}.</Text> : null}
                    </>
                  ) : <Text color="secondary">The backtest has no cells to show.</Text>}
                </>
              )}
            </VStack>
          </Card>
        </>
      )}

      <Card padding={4}>
        <VStack gap={3}>
          <Heading level={2}>Model card</Heading>
          {CARD.map((s) => (
            <VStack gap={1} key={s.title}>
              <Heading level={3}>{s.title}</Heading>
              {s.body.map((b) => <Text key={b}>{b}</Text>)}
            </VStack>
          ))}
        </VStack>
      </Card>
    </VStack>
  );
}
