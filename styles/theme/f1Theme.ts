import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral";

/**
 * F1 Control Room theme: charcoal and warm sand neutrals, F1 red only on the accent
 * (primary actions, live states). Tokens are [light, dark]. After editing run `npm run build:theme`.
 * Focus rings and accent text stay neutral so red never leaks onto links or selection.
 */
export const f1Theme = defineTheme({
  name: "f1",
  extends: neutralTheme,
  tokens: {
    "--color-background-body": ["#F3EFE7", "#15161A"],
    "--color-background-surface": ["#FBF9F5", "#1C1D22"],
    "--color-background-card": ["#FBF9F5", "#1C1D22"],
    "--color-background-popover": ["#FFFFFF", "#25262C"],
    "--color-background-muted": ["#2A25190D", "#0C0D0F80"],
    "--color-text-primary": ["#1A1A1C", "#ECE6DA"],
    "--color-text-secondary": ["#5A554B", "#B3ACA0"],
    "--color-text-disabled": ["#A39C8F", "#6C685F"],
    "--color-border": ["#2A251926", "#ECE6DA1F"],
    "--color-border-emphasized": ["#CFC7B8", "#43454D"],
    "--color-accent": ["#D10600", "#E10600"],
    "--color-on-accent": ["#FFFFFF", "#FFFFFF"],
    "--color-accent-muted": ["#D1060026", "#E1060033"],
    "--color-text-accent": ["#1A1A1C", "#ECE6DA"],
    "--color-icon-accent": ["#1A1A1C", "#ECE6DA"],
    "--focus-outline-color": ["#1A1A1C", "#ECE6DA"],
  },
});
