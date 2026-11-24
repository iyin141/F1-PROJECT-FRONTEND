/** Mock chaos payloads: plausible numbers, same shapes as docs/v2/progress/A2-chaos.md. Deterministic. */
import type {
  ChaosFactor, ChaosModelBlock, ChaosTarget, CircuitHistory, CircuitSummary, DriverProfile, DriversChaos, LapsChaos, ModelCell,
  ModelPage, Prob, RaceChaos, ReliabilityBin,
} from "@/Lib/api/v2/payloads";

const block = (model: ChaosModelBlock["model"] = "kumo_tabular_calibrated"): ChaosModelBlock => ({
  model, size: "mock", run_id: 1, race_key: "mock", context_rows: 4200, calibration: "isotonic", calibrated: true,
  is_fallback: false, fallback_reason: null, selected_by: "default order: calibrated Kumo, then baseline",
  interval: "mock fixture", updated: "2026-11-01T00:00:00Z",
});

const p = (probability: number, w = 0.08): Prob => ({
  probability, p10: +Math.max(0, probability - w).toFixed(5), p90: +Math.min(1, probability + w).toFixed(5),
});

const RACE: Partial<Record<ChaosTarget, Prob>> = {
  sc_vsc_red: p(0.62, 0.12), dnf_mechanical: p(0.31, 0.1), dnf_incident: p(0.44, 0.11), slow_stop: p(0.2, 0.07), unlucky_stop: p(0.12, 0.06),
};

const factor = (target: ChaosTarget, label: string, predicted: number, reference: number, name: string, k: number, n: number): ChaosFactor => ({
  target, label, predicted, reference, reference_name: name, difference: +(predicted - reference).toFixed(4),
  direction: predicted > reference ? "higher" : "lower", circuit_history: { races_with_event: k, races: n },
  text: `${label}: ${Math.round(predicted * 100)}% here vs ${Math.round(reference * 100)}% typical for ${name}; happened in ${k} of ${n} past races at this circuit`,
});

export function raceChaos(year: number, round: number): RaceChaos {
  return {
    meta: { year, round, circuit: "mock-ring", circuit_type: "street" },
    model: block(), targets: RACE, chaos_index: 2.31, chaos_index_band: { p10: 1.4, p90: 3.3, note: "sums of per-entity p10/p90: a wide, conservative band, not a joint interval" },
    index_targets: ["sc_vsc_red", "dnf_mechanical", "dnf_incident"],
    expected_events: {
      sc_vsc_red: { value: 0.92, p10: 0.5, p90: 1.4, source: "sum of 12 lap windows" },
      dnf_mechanical: { value: 0.58, p10: 0.3, p90: 0.9, source: "sum of 20 drivers" },
      dnf_incident: { value: 0.81, p10: 0.4, p90: 1.3, source: "sum of 20 drivers" },
    },
    factors: [
      factor("sc_vsc_red", "Safety car, VSC or red flag", 0.62, 0.41, "street circuits", 7, 9),
      factor("dnf_incident", "Incident retirement", 0.44, 0.33, "street circuits", 6, 9),
      factor("dnf_mechanical", "Mechanical retirement", 0.31, 0.36, "street circuits", 3, 9),
    ],
  };
}

const CODES: [string, string][] = [["VER", "Red Bull"], ["NOR", "McLaren"], ["LEC", "Ferrari"], ["PIA", "McLaren"], ["HAM", "Ferrari"], ["RUS", "Mercedes"], ["SAI", "Williams"], ["ALO", "Aston Martin"]];

export function driversChaos(year: number, round: number): DriversChaos {
  const drivers = CODES.map(([driver, team], i) => ({
    driver, team,
    targets: {
      dnf_mechanical: p(0.03 + (i % 4) * 0.01, 0.02), dnf_incident: p(0.06 + ((i * 3) % 5) * 0.012, 0.03),
      slow_stop: p(0.05 + (i % 3) * 0.01, 0.03), unlucky_stop: p(0.04, 0.04),
    },
  }));
  return {
    meta: raceChaos(year, round).meta, model: block(), ranked_by: "combined retirement probability, highest first",
    note: "Unlucky stop is mostly luck and team strategy: a tendency with a wide interval, never a skill rating.",
    drivers: drivers.sort((a, b) => (b.targets.dnf_mechanical!.probability + b.targets.dnf_incident!.probability) - (a.targets.dnf_mechanical!.probability + a.targets.dnf_incident!.probability)),
  };
}

export function lapsChaos(year: number, round: number, target: ChaosTarget): LapsChaos {
  const total = 58, size = 5, n = Math.ceil(total / size);
  const windows = Array.from({ length: n }, (_, i) => {
    const w = i + 1;
    const base = 0.05 + 0.1 * Math.exp(-((w - 1) ** 2) / 2) + 0.06 * Math.exp(-((w - 7) ** 2) / 8);
    return { window: w, lap_start: i * size + 1, lap_end: Math.min(w * size, total), targets: { [target]: p(+base.toFixed(4), 0.03) } };
  });
  return {
    meta: { ...raceChaos(year, round).meta, window_size: size, total_laps: total, total_laps_note: "latest known race length: the median of past races until this race has run" },
    model: block(), target, strip: windows.map((w) => w.targets[target]!.probability), windows,
  };
}

const CIRCUITS: [string, string, string][] = [
  ["monaco", "Monaco", "street"], ["baku", "Baku", "street"], ["singapore", "Singapore", "street"], ["jeddah", "Jeddah", "street"],
  ["monza", "Monza", "high-speed"], ["spa", "Spa-Francorchamps", "high-speed"], ["silverstone", "Silverstone", "high-speed"],
  ["suzuka", "Suzuka", "technical"], ["hungaroring", "Hungaroring", "technical"], ["barcelona", "Barcelona", "technical"],
  ["bahrain", "Bahrain", "balanced"], ["interlagos", "Interlagos", "balanced"],
];
export const circuitList = (): CircuitSummary[] => CIRCUITS.map(([slug, name, circuit_type]) => ({ slug, name, circuit_type }));
const seed = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 997, 7);

const share = <T,>(rows: T[], f: (r: T) => boolean) => +(rows.filter(f).length / rows.length).toFixed(3);

export function circuitHistory(slug: string): CircuitHistory {
  const k = seed(slug);
  const races = Array.from({ length: 9 }, (_, i) => ({
    year: 2016 + i, round: 6, safety_cars: (i + k) % 3 === 0 ? 1 : 0, vscs: (i + k) % 4 === 1 ? 1 : 0, red_flags: (i * k) % 9 === 4 ? 1 : 0,
    neutralisation_laps: (i + k) % 3 === 0 ? [12 + i] : [], dnf_mechanical: (i + k) % 3, dnf_incident: (i * k + 1) % 4, slow_stops: i % 2, unlucky_stops: 0,
  }));
  return {
    circuit: { slug, name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), type: "street", length_m: 5412, corners: 14, wall_proximity: 0.8, overtaking_index: 0.3, elevation_range_m: 12 },
    summary: {
      races: races.length,
      safety_car_rate: share(races, (r) => r.safety_cars > 0), vsc_rate: share(races, (r) => r.vscs > 0), red_flag_rate: share(races, (r) => r.red_flags > 0),
      any_neutralisation_rate: share(races, (r) => r.safety_cars + r.vscs + r.red_flags > 0),
      mean_mechanical_dnfs: +(races.reduce((a, r) => a + r.dnf_mechanical, 0) / races.length).toFixed(2),
      mean_incident_dnfs: +(races.reduce((a, r) => a + r.dnf_incident, 0) / races.length).toFixed(2),
    },
    races,
  };
}

export function driverProfile(code: string): DriverProfile {
  const t = (label: string, tendency: number, w: number) => ({ label, tendency, p10: +(tendency - w).toFixed(4), p90: +(tendency + w).toFixed(4), races_with_event: 3, races: 40 });
  return {
    driver: code, last_team: "Mock Team", seasons: [2022, 2023, 2024], races: 40,
    label: "Tendencies, not skill ratings: shrunk toward the team and field average; read the interval, which is wide for few races.",
    tendencies: { dnf_mechanical: t("Mechanical retirement", 0.04, 0.03), dnf_incident: t("Incident retirement", 0.07, 0.04), slow_stop: t("Slow pit stop", 0.06, 0.04), unlucky_stop: t("Unlucky stop", 0.05, 0.05) },
  };
}

function cell(brier: number, ll: number, auc: number, gap: number): ModelCell {
  const bins: ReliabilityBin[] = Array.from({ length: 10 }, (_, i) => {
    const mean = (i + 0.5) / 10;
    return { lo: i / 10, hi: (i + 1) / 10, n: Math.round(220 * Math.exp(-i / 2.5)) + 6, mean_pred: +mean.toFixed(3), frac_pos: +Math.min(1, Math.max(0, mean + gap * Math.sin(i))).toFixed(3) };
  });
  return { n: 1380, base_rate: 0.41, brier, log_loss: ll, auc, bins, ece: +(gap * 0.6).toFixed(4) };
}

export function modelPage(): ModelPage {
  const cells = ["race|sc_vsc_red", "driver|dnf_mechanical", "driver|dnf_incident"];
  const mk = (b: number, l: number, a: number, g: number) => Object.fromEntries(cells.map((c, i) => [c, cell(b + i * 0.01, l + i * 0.02, a - i * 0.02, g)]));
  return {
    current_runs: [{ id: 1, model: "kumo_tabular_calibrated", size: "mock", race_key: "mock", context_rows: 4200, git_sha: "mock", updated: "2026-11-01T00:00:00Z", calibrated: true, interval: "mock", calibration: "isotonic" }],
    backtest: {
      run_id: 2, seasons: [2019, 2020, 2021, 2022, 2023, 2024], models: ["beta_binomial", "lightgbm", "kumo"], skipped_models: null,
      prior_strength: 8, canada_check: null, races: 138,
      results: { beta_binomial: mk(0.225, 0.65, 0.64, 0.03), lightgbm: mk(0.212, 0.61, 0.69, 0.05), kumo: mk(0.2, 0.58, 0.71, 0.02) },
      note: "overall = pooled leave-one-season-out predictions; bins are the 10-bin reliability table. MOCK DATA.",
    },
  };
}
