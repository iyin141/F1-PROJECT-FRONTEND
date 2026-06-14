import type { Driver, Team, TeamId } from "@/types/ui";

export const TEAMS: Record<TeamId, Team> = {
  "red-bull":     { id: "red-bull",     name: "Oracle Red Bull Racing",   shortName: "Red Bull",  colorVar: "--team-red-bull" },
  "ferrari":      { id: "ferrari",      name: "Scuderia Ferrari",         shortName: "Ferrari",   colorVar: "--team-ferrari" },
  "mercedes":     { id: "mercedes",     name: "Mercedes-AMG Petronas",    shortName: "Mercedes",  colorVar: "--team-mercedes" },
  "mclaren":      { id: "mclaren",      name: "McLaren F1 Team",          shortName: "McLaren",   colorVar: "--team-mclaren" },
  "aston-martin": { id: "aston-martin", name: "Aston Martin Aramco",      shortName: "Aston",     colorVar: "--team-aston-martin" },
  "alpine":       { id: "alpine",       name: "BWT Alpine F1 Team",       shortName: "Alpine",    colorVar: "--team-alpine" },
  "williams":     { id: "williams",     name: "Williams Racing",          shortName: "Williams",  colorVar: "--team-williams" },
  "rb":           { id: "rb",           name: "Visa Cash App RB",         shortName: "RB",        colorVar: "--team-rb" },
  "haas":         { id: "haas",         name: "MoneyGram Haas F1",        shortName: "Haas",      colorVar: "--team-haas" },
  "sauber":       { id: "sauber",       name: "Stake F1 Team Kick Sauber", shortName: "Sauber",   colorVar: "--team-sauber" },
};

export const DRIVERS: Driver[] = [
  // 2026 grid — kept alongside 2024/2025 names so historical data still resolves

  // Red Bull
  { id: "VER", code: "VER", number: 1,  firstName: "Max",       lastName: "Verstappen", team: "red-bull" },
  { id: "LAW", code: "LAW", number: 30, firstName: "Liam",      lastName: "Lawson",     team: "red-bull" },

  // Ferrari
  { id: "LEC", code: "LEC", number: 16, firstName: "Charles",   lastName: "Leclerc",    team: "ferrari" },
  { id: "HAM", code: "HAM", number: 44, firstName: "Lewis",     lastName: "Hamilton",   team: "ferrari" },

  // Mercedes
  { id: "RUS", code: "RUS", number: 63, firstName: "George",    lastName: "Russell",    team: "mercedes" },
  { id: "ANT", code: "ANT", number: 12, firstName: "Kimi",      lastName: "Antonelli",  team: "mercedes" },

  // McLaren
  { id: "NOR", code: "NOR", number: 4,  firstName: "Lando",     lastName: "Norris",     team: "mclaren" },
  { id: "PIA", code: "PIA", number: 81, firstName: "Oscar",     lastName: "Piastri",    team: "mclaren" },

  // Aston Martin
  { id: "ALO", code: "ALO", number: 14, firstName: "Fernando",  lastName: "Alonso",     team: "aston-martin" },
  { id: "STR", code: "STR", number: 18, firstName: "Lance",     lastName: "Stroll",     team: "aston-martin" },

  // Alpine
  { id: "GAS", code: "GAS", number: 10, firstName: "Pierre",    lastName: "Gasly",      team: "alpine" },
  { id: "DOO", code: "DOO", number: 7,  firstName: "Jack",      lastName: "Doohan",     team: "alpine" },

  // Williams
  { id: "ALB", code: "ALB", number: 23, firstName: "Alexander", lastName: "Albon",      team: "williams" },
  { id: "SAI", code: "SAI", number: 55, firstName: "Carlos",    lastName: "Sainz",      team: "williams" },

  // RB / Visa Cash App RB
  { id: "TSU", code: "TSU", number: 22, firstName: "Yuki",      lastName: "Tsunoda",    team: "rb" },
  { id: "HAD", code: "HAD", number: 6,  firstName: "Isack",     lastName: "Hadjar",     team: "rb" },

  // Haas
  { id: "OCO", code: "OCO", number: 31, firstName: "Esteban",   lastName: "Ocon",       team: "haas" },
  { id: "BEA", code: "BEA", number: 87, firstName: "Oliver",    lastName: "Bearman",    team: "haas" },

  // Sauber (Audi from 2026)
  { id: "HUL", code: "HUL", number: 27, firstName: "Nico",      lastName: "Hülkenberg", team: "sauber" },
  { id: "BOR", code: "BOR", number: 5,  firstName: "Gabriel",   lastName: "Bortoleto",  team: "sauber" },

  // Retained for historical data resolution (2024/2025 stints)
  { id: "PER", code: "PER", number: 11, firstName: "Sergio",    lastName: "Pérez",      team: "red-bull" },
  { id: "SAR", code: "SAR", number: 2,  firstName: "Logan",     lastName: "Sargeant",   team: "williams" },
  { id: "RIC", code: "RIC", number: 3,  firstName: "Daniel",    lastName: "Ricciardo",  team: "rb" },
  { id: "MAG", code: "MAG", number: 20, firstName: "Kevin",     lastName: "Magnussen",  team: "haas" },
  { id: "BOT", code: "BOT", number: 77, firstName: "Valtteri",  lastName: "Bottas",     team: "sauber" },
  { id: "ZHO", code: "ZHO", number: 24, firstName: "Zhou",      lastName: "Guanyu",     team: "sauber" },
];

export const driverById = (id: string) => DRIVERS.find((d) => d.id === id)!;
