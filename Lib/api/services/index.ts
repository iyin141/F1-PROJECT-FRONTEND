// Central aggregator for per-route service helpers. Keep `index.ts` as a
// backward-compatible surface while implementations live in route modules.

import { apiFetch } from "./client";

export * from "./races";
export * from "./standings";
export * from "./unified";
export * from "./analysis";
export * from "./drivers";

export default { apiFetch };
