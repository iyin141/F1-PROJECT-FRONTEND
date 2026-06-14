import type { CareerSeason, SeasonRace } from "@/features/driver-record/types/driverRecord.types";

export type IncompleteStatField = "podiums" | "poles" | "fastest_laps";

function getNumericValue(season: CareerSeason, field: IncompleteStatField): number {
  if (field === "podiums") {
    return season.podiums;
  }

  // These fields are not present in the current API payload; treat as zero until backend support lands.
  return 0;
}

export function isStatIncomplete(season: CareerSeason, field: IncompleteStatField): boolean {
  const value = getNumericValue(season, field);

  if (value > 0) {
    return false;
  }

  if (field === "podiums") {
    return season.wins > 0 && season.podiums === 0;
  }

  return season.races > 5 && value === 0;
}

export function displayStat(season: CareerSeason, field: IncompleteStatField): string {
  if (isStatIncomplete(season, field)) {
    return "-";
  }

  const value = getNumericValue(season, field);
  return String(value);
}

export function careerHasIncompleteStats(seasons: CareerSeason[]): boolean {
  return seasons.some((season) =>
    isStatIncomplete(season, "podiums") ||
    isStatIncomplete(season, "poles") ||
    isStatIncomplete(season, "fastest_laps"),
  );
}

export function seasonHasQualifyingData(races: SeasonRace[]): boolean {
  return races.some(
    (race) => race.qualifyingPosition !== null || race.qualifyingTime !== null,
  );
}

export function formatFinish(
  position: number | null,
  status?: string | null,
): string {
  if (position === null) {
    if (status) {
      const upper = status.toUpperCase();
      if (upper.includes("DNF") || upper.includes("DNS") || upper.includes("DSQ")) {
        return upper.includes("DNF") ? "DNF" : upper.includes("DNS") ? "DNS" : "DSQ";
      }
    }

    return "-";
  }

  return String(position);
}
