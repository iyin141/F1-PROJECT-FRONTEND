import type { ReactNode } from "react";

export type TeamId =
  | "red-bull"
  | "ferrari"
  | "mercedes"
  | "mclaren"
  | "aston-martin"
  | "alpine"
  | "williams"
  | "rb"
  | "haas"
  | "sauber";

export type Compound = "soft" | "medium" | "hard" | "inter" | "wet";

export interface Driver {
  id: string;
  code: string;
  number: number;
  firstName: string;
  lastName: string;
  team: TeamId;
}

export interface Team {
  id: TeamId;
  name: string;
  shortName: string;
  colorVar: string;
}

export type SessionId =
  | "fp1"
  | "fp2"
  | "fp3"
  | "qualifying"
  | "race"
  | "sprint"
  | "sprint-qualifying"
  | "sprint-shootout";

export interface Circuit {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  city: string;
  laps: number;
  lengthKm: number;
}

export interface SessionSchedule {
  id: SessionId;
  startsAt: string;
  durationMin: number;
}

export interface Race {
  year: number;
  round: number;
  name: string;
  shortName: string;
  date: string;
  circuit: Circuit;
  status: "completed" | "upcoming" | "live";
  sessions: SessionSchedule[];
  eventFormat?: string;
}

export interface RaceResult {
  position: number | "DNF" | "DSQ";
  driver: Driver;
  laps: number;
  time?: string;
  gap?: string;
  points: number;
  fastestLap?: boolean;
  fastestLapTime?: string | null;
  status?: string;
  startGrid: number;
}

export interface Incident {
  lap: number;
  type: "SC" | "VSC" | "Red" | "Collision" | "DNF";
  description: string;
  drivers?: string[];
}

export interface WeatherSnapshot {
  airTempC: number;
  trackTempC: number;
  conditions: "Dry" | "Wet" | "Mixed" | "Cloudy";
  windKph: number;
  humidity: number;
}

export interface DriverStanding {
  position: number;
  driver: Driver;
  points: number;
  wins: number;
  podiums: number;
  gapToLeader?: number;
}

export interface ConstructorStanding {
  position: number;
  team: Team;
  points: number;
  wins: number;
}

export interface QualifyingResult {
  position: number;
  driver: Driver;
  q1?: string;
  q2?: string;
  q3?: string;
  q1Ms?: number;
  q2Ms?: number;
  q3Ms?: number;
  bestSector1?: number;
  bestSector2?: number;
  bestSector3?: number;
}

export interface PracticeResult {
  position: number;
  driver: Driver;
  bestLap: string;
  bestLapMs?: number;
  laps: number;
  gap?: string;
  compound?: Compound;
}

export interface ChampionshipImpact {
  driver: Driver;
  pointsGained: number;
  newTotal: number;
  gapToLeader: number;
}

export type FlagType = "GREEN" | "SC" | "VSC" | "YELLOW" | "RED";
export type ReplayStatus = "DNF" | "DNS" | null;

export interface ReplayRawDriverLap {
  lap?: number | null;
  driverCode?: string | null;
  driverNumber?: number | null;
  position?: number | null;
  positionChange?: number | null;
  gapToLeaderSeconds?: number | null;
  gapToAheadSeconds?: number | null;
  lapTimeSeconds?: number | null;
  lapTime?: string | null;
  pitDurationSeconds?: number | null;
  stopNumber?: number | null;
  compoundIn?: string | null;
  compoundOut?: string | null;
  incidentType?: string | null;
  incidentFlag?: string | null;
  incidentMessage?: string | null;
  incidentMessageType?: string | null;
  incidentDrivers?: string[] | null;
}

export interface ReplayPosition {
  driver: string;
  name: string;
  driverNumber?: number;
  team: TeamId;
  gap: string;
  interval: string;
  positionChange?: number | null;
  tyre: Compound;
  tyreLap: number;
  stints: Compound[];
  lastLapTime?: string | null;
  stopNumber?: number;
  pitDurationSeconds?: number | null;
  pitTyreIn?: Compound;
  pitTyreOut?: Compound;
  inPit: boolean;
  dnf?: boolean;
  fastLap?: boolean;
  pole: boolean;
  status?: ReplayStatus;
}

export interface ReplayLapIncident {
  type: string;
  message?: string;
  flag?: string;
  drivers?: string[];
  severity?: string;
}

export interface ReplayFrame {
  lap: number;
  flag: FlagType;
  flagSequence?: FlagType[];
  usedCompounds?: Compound[];
  lapIncidents?: ReplayLapIncident[];
  positions: ReplayPosition[];
}

export interface LapTime {
  lap: number;
  driverId: string;
  timeMs: number;
  sector1Ms?: number;
  sector2Ms?: number;
  sector3Ms?: number;
  position: number;
  compound: Compound;
  pit?: boolean;
}

export interface Stint {
  driverId: string;
  stintNumber: number;
  startLap: number;
  endLap: number;
  compound: Compound;
  avgPaceMs: number;
  bestLapMs?: number | null;
  degradationMs?: number | null;
}

export interface SectorAnalysis {
  driverId: string;
  s1Ms: number;
  s2Ms: number;
  s3Ms: number;
}

export interface ConsistencyScore {
  driver: Driver;
  score: number;
  bestLapMs: number;
  avgLapMs: number;
  topCompound: Compound;
}

// ---------------------------------------------------------------------------
// Per-lap nullable analysis model
// ---------------------------------------------------------------------------

export interface RaceLapDriverEntry {
  lapTimeMs: number | null;
  compound: Compound | null;
  stint: number | null;
  sector1Ms: number | null;
  sector2Ms: number | null;
  sector3Ms: number | null;
  isPersonalBest: boolean | null;
}

export interface RaceLapFrame {
  lap: number;
  /** Keyed by driver code, e.g. "VER", "LEC". */
  drivers: Record<string, RaceLapDriverEntry>;
}

// ---------------------------------------------------------------------------
// Teammate battle types
// ---------------------------------------------------------------------------

export type RacePhase = "early" | "mid" | "late";

export interface PhaseBattle {
  phase: RacePhase;
  lapFrom: number;
  lapTo: number;
  aAvgMs: number | null;
  bAvgMs: number | null;
  /** driver code of faster driver, or null if tie / insufficient data */
  winner: string | null;
  deltaMs: number | null;
}

export interface TeammateBattle {
  teamId: TeamId;
  driverA: Driver;
  driverB: Driver;
  phases: PhaseBattle[];
  /** driver code of the overall faster teammate, or null if inconclusive */
  overallWinner: string | null;
}

// ---------------------------------------------------------------------------
// Shared component types
// ---------------------------------------------------------------------------

export type Speed = 1 | 2 | 4;

export interface RaceTabProps {
  year: number;
  round: number;
  upcoming: boolean;
  enabled?: boolean;
}

export interface PodiumEntry {
  position: number | string;
  driver: {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    team: TeamId;
  };
}

export interface PodiumBlockProps<T extends PodiumEntry> {
  results: T[];
  renderStats?: (result: T, isWinner: boolean, accent: string) => ReactNode;
  label?: string;
}

export type RowVariant = "default" | "fastlap" | "pole" | "pit" | "dnf" | "safety-car";

export type ColumnDef<T> = {
  key: string;
  width: string;
  header?: ReactNode;
  align?: "left" | "right" | "center";
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T, idx: number) => ReactNode;
};

// ---------------------------------------------------------------------------
// Driver career / season UI types (camelCase) — added in Phase 1 refactor.
// These are derived from the backend endpoint shapes but are strictly UI-layer
// types so components never import endpoint types directly.
// ---------------------------------------------------------------------------

export interface DriverCareerSeason {
  year: number;
  races: number;
  wins: number;
  podiums: number;
  champion: boolean;
}

export interface DriverCareer {
  driverCode: string;
  driverName: string;
  nationality: string;
  seasons: DriverCareerSeason[];
  totalWins: number;
  totalPodiums: number;
  championships: number;
}

export interface DriverSeasonRace {
  year: number;
  round: number;
  raceName: string;
  location: string;
  raceDate: string;
  gridPosition: number | null;
  finishPosition: number | null;
  points: number;
  status: string;
  fastestLap: boolean;
  lapsCompleted: number | null;
  qualifyingPosition: number | null;
  qualifyingTime: string | null;
}

export interface DriverSeason {
  driverCode: string;
  driverName: string;
  year: number;
  totalRaces: number;
  sprintWeekends: number;
  races: DriverSeasonRace[];
}
