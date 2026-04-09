import type { ResolvedTheme, ThemeMode } from "@/types/theme";

export const THEME_STORAGE_KEY = "f1-theme-preference";

export const DEFAULT_THEME: ThemeMode = "dark";

export const THEME_MODES = ["dark", "light", "system"] as const;

export function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return Boolean(value && THEME_MODES.includes(value as ThemeMode));
}

export function resolveTheme(theme: ThemeMode, systemTheme: ResolvedTheme): ResolvedTheme {
  return theme === "system" ? systemTheme : theme;
}
