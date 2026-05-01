'use client';

import { Panel } from "@/components/Panel";
import { EmptyState } from "@/components/EmptyState";

export default function DriverRecordPage() {
  return (
    <main className="page-shell w-full">
      <Panel label="DRIVER RECORD" title="Archive">
        <EmptyState
          message="DRIVER RECORD PAGE"
          description="Use race pages to open the Driver Record tab for event-specific records."
        />
      </Panel>
    </main>
  );
}
