/**
 * Precise payload types for the v2 endpoints.
 *
 * The OpenAPI file types most v2 fields as bare `object`, so the shapes here come from the backend
 * progress notes and serializers (docs/v2/progress/A1-trackmap.md, A2-chaos.md, A3-stewards.md).
 * `schema.d.ts` (generated, `npm run gen:api`) stays the source for paths, params and status codes.
 */

/** 202 body for routes that queue a build and ask the client to retry. */
export type Pending = { status: string; task_key: string; detail: string };

// ---- track map (A1) --------------------------------------------------------------------------

export type MiniSectorScheme = "distance" | "corners";

export type TrackCorner = {
  number: number;
  letter: string;
  angle: number;
  distance: number | null;
  x: number;
  y: number;
};

export type TrackMapResponse = {
  meta: {
    year: number;
    round: number;
    scheme: MiniSectorScheme;
    circuit_key: string | number;
    layout_hash: string;
    geometry_year: number;
    source: string;
    point_count: number;
    /** x/y/z are in 1/10 m; distance is metres. */
    position_unit: "1/10 m";
  };
  /** Columnar, about 1,500 points, uniform distance step. */
  points: { x: number[]; y: number[]; z: number[]; distance: number[] };
  corners: TrackCorner[];
  /** Chosen scheme: boundaries in metres (n+1 values for n sectors); labels only for `corners`. */
  mini_sectors: { boundaries: number[]; labels?: string[] };
  drs_zones: { start_m: number; end_m: number }[];
};

export type LapTimeSource = "telemetry" | "official" | "integrated";

export type MiniSectorsResponse = {
  meta: {
    year: number;
    round: number;
    session: string;
    scheme: MiniSectorScheme;
    lap: string | number;
    sector_count: number;
    circuit_key: string | number;
    layout_hash: string;
  };
  boundaries: number[];
  labels: string[];
  drivers: Record<
    string,
    { lap_number: number; lap_time: number; lap_time_source: LapTimeSource; sector_times: number[] }
  >;
  fastest_per_sector: { sector: number; driver: string; time: number }[];
  /** Seconds behind the fastest driver, per sector. */
  gaps: Record<string, number[]>;
};

export type DeltaResponse = {
  meta: {
    year: number;
    round: number;
    session: string;
    lap: string | number;
    circuit_key: string | number;
    layout_hash: string;
    point_count: number;
    delta_sign: string;
  };
  ref: { driver: string; lap_number: number; lap_time: number; lap_time_source: LapTimeSource };
  cmp: { driver: string; lap_number: number; lap_time: number; lap_time_source: LapTimeSource };
  distance: number[];
  /** Seconds; positive = cmp slower than ref. */
  delta: number[];
};

// ---- columnar telemetry (A1, phase 1c) ---------------------------------------------------------

export const TELEMETRY_CHANNELS = ["speed", "throttle", "brake", "gear", "rpm", "drs", "time"] as const;
export type TelemetryChannel = (typeof TELEMETRY_CHANNELS)[number];

/** Request parameters shared by `telemetry/` and `telemetry/overlay/`. */
export type TelemetryParams = {
  driver: string;
  lap?: number;
  session?: string;
  start_m?: number;
  end_m?: number;
  channels?: TelemetryChannel[];
  format?: "rows" | "columnar";
};

/** `data` of a `format=columnar` telemetry response: one equal-length array per key. */
export type ColumnarTelemetry = {
  driver_code: string[];
  lap_number: number[];
  distance_m: number[];
  speed_kph?: (number | null)[];
  throttle_pct?: (number | null)[];
  brake?: (boolean | number | null)[];
  gear?: (number | null)[];
  rpm?: (number | null)[];
  drs?: (boolean | null)[];
  time_seconds?: (number | null)[];
};

export type ColumnarTelemetryResponse = {
  meta: Record<string, unknown> & { year: number; round: number; session: string; driver: string };
  filters_applied: {
    driver: string;
    lap?: number;
    start_m?: number | null;
    end_m?: number | null;
    channels?: TelemetryChannel[] | null;
    format?: "rows" | "columnar";
  };
  data: ColumnarTelemetry;
};

// ---- chaos (A2) --------------------------------------------------------------------------------

export type ChaosTarget =
  | "sc_vsc_red"
  | "dnf_mechanical"
  | "dnf_incident"
  | "slow_stop"
  | "unlucky_stop";

export type Prob = { probability: number; p10: number; p90: number };

export type ChaosModelBlock = {
  model: "kumo_tabular_calibrated" | "kumo_tabular" | "beta_binomial";
  size: string;
  run_id: number;
  race_key: string;
  context_rows: number;
  calibration: string;
  calibrated: boolean;
  /** True when the baseline is served because no calibrated Kumo run exists. Show it, never hide it. */
  is_fallback: boolean;
  fallback_reason: string | null;
  selected_by: string;
  interval: string;
  updated: string;
};

export type ChaosPending = Pending;

export type ChaosFactor = {
  target: ChaosTarget;
  label: string;
  predicted: number;
  reference: number;
  reference_name: string;
  difference: number;
  direction: "higher" | "lower";
  circuit_history: { races_with_event: number; races: number };
  text: string;
};

export type RaceChaos = {
  meta: { year: number; round: number; circuit: string | null; circuit_type: string | null };
  model: ChaosModelBlock;
  targets: Partial<Record<ChaosTarget, Prob>>;
  chaos_index: number;
  chaos_index_band: { p10: number; p90: number; note: string };
  index_targets: ChaosTarget[];
  expected_events: Partial<Record<ChaosTarget, { value: number; p10: number; p90: number; source: string }>>;
  factors: ChaosFactor[];
};

export type DriversChaos = {
  meta: RaceChaos["meta"];
  model: ChaosModelBlock;
  ranked_by: string;
  note: string;
  drivers: { driver: string; team: string; targets: Partial<Record<ChaosTarget, Prob>> }[];
};

export type LapsChaos = {
  meta: RaceChaos["meta"] & { window_size: number; total_laps: number | null; total_laps_note: string };
  model: ChaosModelBlock;
  target: ChaosTarget;
  /** One probability per 5-lap window, for the heat strip. */
  strip: (number | null)[];
  windows: { window: number; lap_start: number; lap_end: number; targets: Partial<Record<ChaosTarget, Prob>> }[];
};

export type CircuitHistory = {
  circuit: {
    slug: string;
    name: string;
    type: string;
    length_m: number | null;
    corners: number | null;
    wall_proximity: number | null;
    overtaking_index: number | null;
    elevation_range_m: number | null;
  };
  summary: {
    races: number;
    safety_car_rate: number | null;
    vsc_rate: number | null;
    red_flag_rate: number | null;
    any_neutralisation_rate: number | null;
    mean_mechanical_dnfs: number | null;
    mean_incident_dnfs: number | null;
  };
  races: {
    year: number;
    round: number;
    safety_cars: number;
    vscs: number;
    red_flags: number;
    neutralisation_laps: number[];
    dnf_mechanical: number;
    dnf_incident: number;
    slow_stops: number;
    unlucky_stops: number;
  }[];
};

/** GET /api/chaos/circuits/ (A2 adding): one entry per known circuit. */
export type CircuitSummary = { slug: string; name: string; circuit_type: string };

export type DriverProfile = {
  driver: string;
  last_team: string;
  seasons: number[];
  races: number;
  /** "Tendencies, not skill ratings ..." Show it verbatim next to the numbers. */
  label: string;
  tendencies: Record<
    string,
    { label: string; tendency: number; p10: number; p90: number; races_with_event: number; races: number }
  >;
};

export type ReliabilityBin = { lo: number; hi: number; n: number; mean_pred: number; frac_pos: number };
export type ModelCell = {
  n: number;
  base_rate: number;
  brier: number;
  log_loss: number;
  auc: number | null;
  bins?: ReliabilityBin[];
  ece?: number;
};

export type ModelPage = {
  current_runs: {
    id: number;
    model: string;
    size: string;
    race_key: string;
    context_rows: number;
    git_sha: string;
    updated: string;
    calibrated: boolean | null;
    interval: string | null;
    calibration: string | null;
  }[];
  backtest: {
    run_id: number;
    seasons: number[];
    models: string[];
    skipped_models: string[] | null;
    prior_strength: number | null;
    canada_check: unknown;
    races: number;
    /** backtest model (beta_binomial, lightgbm, kumo) -> "scope|target" (e.g. "race|sc_vsc_red") -> pooled leave-one-season-out metrics. */
    results: Record<string, Record<string, ModelCell>>;
    note: string;
  } | null;
};

// ---- assistant SSE (A3) ------------------------------------------------------------------------

export type AssistantPhase = "queued" | "solving" | "searching" | "composing";

export type AssistantCitation = {
  /** Evidence id as cited in the answer text. */
  id: string;
  /** 1-based order of first appearance in the answer. */
  n: number;
  kind: string;
  label: string;
  title: string;
  /** FIA source URL. */
  url: string | null;
  page: number | null;
  article: string | null;
  section: string | null;
  year: number | null;
  race: string | null;
  doc_type: string | null;
  /** The quoted evidence, at most 300 characters. */
  extract: string;
};

export type AssistantDone = {
  rounds: number;
  tools_used: string[];
  evidence_items: number;
  not_found?: boolean;
  grounded: boolean;
  citations: number;
  invalid_citations: string[];
  long_quotes: number;
  cost_usd: number;
};

export type AssistantEvent =
  | { type: "status"; phase: AssistantPhase; message: string; task_key?: string }
  | { type: "token"; text: string }
  | { type: "citations"; citations: AssistantCitation[] }
  | ({ type: "done" } & AssistantDone)
  | { type: "error"; code: "auth_expired" | "rate_limited" | "llm_failed" | "internal" | "timeout"; message: string };

export type AskBody = { question: string; year?: number; round?: number };
