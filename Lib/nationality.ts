const DRIVER_CODE_TO_ISO: Record<string, string> = {
  VER: "nl", NOR: "gb", LEC: "mc", PIA: "au", SAI: "es",
  HAM: "gb", RUS: "gb", PER: "mx", ALO: "es", STR: "ca",
  GAS: "fr", OCO: "fr", ALB: "th", HUL: "de", MAG: "dk",
  TSU: "jp", BOT: "fi", ZHO: "cn", RIC: "au", SAR: "us",
  BEA: "gb", ANT: "it", HAD: "fr", LAW: "nz", DOO: "au", COL: "ar",
};

const NATIONALITY_TO_ISO: Record<string, string> = {
  "British": "gb",
  "Italian": "it",
  "American": "us",
  "French": "fr",
  "German": "de",
  "Brazilian": "br",
  "Argentine": "ar",
  "Swedish": "se",
  "Finnish": "fi",
  "Spanish": "es",
  "Mexican": "mx",
  "Dutch": "nl",
  "Australian": "au",
  "Monegasque": "mc",
  "Canadian": "ca",
  "Thai": "th",
  "Danish": "dk",
  "Japanese": "jp",
  "Chinese": "cn",
  "New Zealander": "nz",
  "Austrian": "at",
  "Swiss": "ch",
  "Belgian": "be",
  "South African": "za",
  "Colombian": "co",
  "Venezuelan": "ve",
  "Russian": "ru",
  "Polish": "pl",
  "Indian": "in",
};

export function getDriverFlagUrl(code: string, size: 20 | 40 | 80 | 160 = 40): string | null {
  const iso = DRIVER_CODE_TO_ISO[code];
  return iso ? `https://flagcdn.com/w${size}/${iso}.png` : null;
}

export function getFlagUrlByNationality(nationality: string, size: 20 | 40 | 80 | 160 = 40): string | null {
  const iso = NATIONALITY_TO_ISO[nationality];
  return iso ? `https://flagcdn.com/w${size}/${iso}.png` : null;
}
