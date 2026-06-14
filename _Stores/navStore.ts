'use client';

import { create } from 'zustand';

export type NavState = {
  homeYear: number | null;
  homeRound: number | null;
  seasonYear: number | null;
  driversYear: number | null;
  driverYear: number | null;
  raceYear: number | null;
  raceRound: number | null;

  setHomeYear: (y: number | null) => void;
  setHomeRound: (r: number | null) => void;
  setSeasonYear: (y: number | null) => void;
  setDriversYear: (y: number | null) => void;
  setDriverYear: (y: number | null) => void;
  setRaceYear: (y: number | null) => void;
  setRaceRound: (r: number | null) => void;

  resetNav: () => void;
};

export const useNavStore = create<NavState>((set: any) => ({
  homeYear: null,
  homeRound: null,
  seasonYear: null,
  driversYear: null,
  driverYear: null,
  raceYear: null,
  raceRound: null,

  setHomeYear: (homeYear: number | null) => set({ homeYear }),
  setHomeRound: (homeRound: number | null) => set({ homeRound }),
  setSeasonYear: (seasonYear: number | null) => set({ seasonYear }),
  setDriversYear: (driversYear: number | null) => set({ driversYear }),
  setDriverYear: (driverYear: number | null) => set({ driverYear }),
  setRaceYear: (raceYear: number | null) => set({ raceYear }),
  setRaceRound: (raceRound: number | null) => set({ raceRound }),

  resetNav: () =>
    set({
      homeYear: null,
      homeRound: null,
      seasonYear: null,
      driversYear: null,
      driverYear: null,
      raceYear: null,
      raceRound: null,
    }),
}));

export default useNavStore;
