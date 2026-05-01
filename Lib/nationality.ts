const DRIVER_CODE_TO_ISO: Record<string, string> = {
  VER: "nl", NOR: "gb", LEC: "mc", PIA: "au", SAI: "es",
  HAM: "gb", RUS: "gb", PER: "mx", ALO: "es", STR: "ca",
  GAS: "fr", OCO: "fr", ALB: "th", HUL: "de", MAG: "dk",
  TSU: "jp", BOT: "fi", ZHO: "cn", RIC: "au", SAR: "us",
  BEA: "gb", ANT: "it", HAD: "fr", LAW: "nz", DOO: "au", COL: "ar",
};

export function getDriverFlagUrl(code: string, size: 20 | 40 | 80 | 160 = 40): string | null {
  const iso = DRIVER_CODE_TO_ISO[code];
  return iso ? `https://flagcdn.com/w${size}/${iso}.png` : null;
}
