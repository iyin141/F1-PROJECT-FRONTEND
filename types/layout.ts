import type { ReactNode } from "react";

export type AppShellProps = {
  children: ReactNode;
};

export type NavigationItem = {
  label: string;
  href: string;
  description?: string;
};
