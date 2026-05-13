export * from "@/types/endpoints";

// Shared frontend route params used by App Router handlers/pages.
export type YearParams = {
  year: string;
};

export type YearRoundParams = {
  year: string;
  round: string;
};

export type IdentifierYearParams = {
  identifier: string;
  year: string;
};
