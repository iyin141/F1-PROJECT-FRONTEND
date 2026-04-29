type CoverageSessionFlags = {
  available: boolean;
  telemetry: boolean;
  incidents: boolean;
};

export type CoverageSessionMap = {
  FP1?: CoverageSessionFlags;
  FP2?: CoverageSessionFlags;
  FP3?: CoverageSessionFlags;
  Q?: CoverageSessionFlags;
  R?: CoverageSessionFlags;
  [session: string]: CoverageSessionFlags | undefined;
};

export type PersistenceCoverageRound = {
  round: number;
  race_name: string;
  sessions: CoverageSessionMap;
};

export type PersistenceCoverageSeasonResponse = {
  year: number;
  coverage: PersistenceCoverageRound[];
};

export type PersistenceCoverageRaceResponse = {
  year: number;
  round: number;
  race_name: string;
  sessions: CoverageSessionMap;
};
