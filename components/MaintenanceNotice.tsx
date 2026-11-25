/**
 * Site-wide notice while the project and its API documentation are being updated.
 * Remove the <MaintenanceNotice /> line in app/layout.tsx when the work is finished.
 */
export function MaintenanceNotice() {
  return (
    <div
      role="status"
      className="w-full border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-center text-sm text-amber-200"
    >
      <strong className="font-semibold">Notice:</strong> This project and its API documentation are being updated. F1 has changed how its data is authorized, so some races, telemetry and 3D-replay data may be missing or out of date, and some endpoints may change, until we finish adapting. Thank you for your patience.{" "}
      <a href="/api/docs/" className="underline underline-offset-2">API documentation</a>
    </div>
  );
}
