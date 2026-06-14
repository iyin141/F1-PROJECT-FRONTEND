"use client";

import React from "react";
import { EmptyState } from "@/components/EmptyState";
import { normalizeSessionForApi } from "@/Lib/sessionCodes";

type Props = {
  session?: string | null;
  validSessions?: string[];
  children?: React.ReactNode;
};

export default function SessionGate({ session, validSessions = ["R", "S", "Q", "SQ", "FP1", "FP2", "FP3"], children }: Props) {
  const norm = normalizeSessionForApi(session ?? undefined);
  if (!norm || !validSessions.includes(norm)) {
    return (
      <EmptyState
        message="SESSION NOT SUPPORTED"
        description={`This view is not available for session: ${String(session ?? "unknown")}.
Supported sessions: ${validSessions.join(", ")}`}
      />
    );
  }
  return <>{children}</>;
}
