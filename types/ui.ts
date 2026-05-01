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

export type SessionId = "fp1" | "fp2" | "fp3" | "qualifying" | "race";

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
}

export interface RaceResult {
  position: number | "DNF" | "DSQ";
  driver: Driver;
  laps: number;
  time?: string;
  gap?: string;
  points: number;
  fastestLap?: boolean;
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
  bestSector1?: number;
  bestSector2?: number;
  bestSector3?: number;
}

export interface PracticeResult {
  position: number;
  driver: Driver;
  bestLap: string;
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

export interface ReplayPosition {
  driver: string;
  name: string;
  team: TeamId;
  gap: string;
  interval: string;
  tyre: Compound;
  tyreLap: number;
  inPit: boolean;
  dnf: boolean;
  fastLap: boolean;
  pole: boolean;
}

export interface ReplayFrame {
  lap: number;
  flag: FlagType;
  positions: ReplayPosition[];
}

export interface LapTime {
  lap: number;
  driverId: string;
  timeMs: number;
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
