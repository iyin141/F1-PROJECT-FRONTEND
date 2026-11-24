"use client";

import Link from "next/link";
import { useTheme as useNextTheme } from "next-themes";
import { LinkProvider } from "@astryxdesign/core/Link";
import { Theme } from "@astryxdesign/core/theme";
import { f1Theme } from "@/styles/theme/f1";

/** Binds the Astryx theme mode to the app's existing next-themes toggle. Dark until the client resolves. */
export function V2Providers({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme();
  return (
    <Theme theme={f1Theme} mode={resolvedTheme === "light" ? "light" : "dark"}>
      <LinkProvider component={Link}>{children}</LinkProvider>
    </Theme>
  );
}
