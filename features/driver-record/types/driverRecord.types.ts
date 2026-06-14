export type DriverRecordReadiness = import("@/types/api").ReadinessChecklist;

export type CareerSeason = import("@/types/ui").DriverCareerSeason;

export type CareerTotals = {
  totalWins: number;
  totalPodiums: number;
  championships: number;
};

export type DriverCareerData = import("@/types/ui").DriverCareer;

export type SeasonRace = import("@/types/ui").DriverSeasonRace;

export type DriverSeasonData = import("@/types/ui").DriverSeason;
