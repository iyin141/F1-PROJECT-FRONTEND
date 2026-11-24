import type { MiniSectorScheme, TelemetryChannel } from "@/Lib/api/v2/payloads";
import { TELEMETRY_CHANNELS } from "@/Lib/api/v2/payloads";
import * as chaos from "./chaos";
import * as track from "./track";

const json = (body: unknown, status = 200) => Response.json(body, { status });
const scheme = (sp: URLSearchParams): MiniSectorScheme => (sp.get("scheme") === "corners" ? "corners" : "distance");

/** v2-only analysis routes. Returns null when the path/params are not a v2 one, so the caller proxies as before. */
export function mockAnalysis(year: number, round: number, slug: string[], sp: URLSearchParams): Response | null {
  const path = slug.join("/");
  const session = sp.get("session") ?? "R";
  if (path === "track-map") return json(track.trackMap(year, round, scheme(sp)));
  if (path === "mini-sectors") {
    const drivers = (sp.get("drivers") ?? "").split(",").filter(Boolean);
    if (!drivers.length) return json({ detail: "drivers is required" }, 400);
    return json(track.miniSectors(year, round, session, scheme(sp), drivers, sp.get("lap") ?? "fastest"));
  }
  if (path === "telemetry/delta") {
    const ref = sp.get("ref"), cmp = sp.get("cmp");
    if (!ref || !cmp) return json({ detail: "ref and cmp are required" }, 400);
    return json(track.delta(year, round, session, ref, cmp, sp.get("lap") ?? "fastest"));
  }
  const v2Params = ["start_m", "end_m", "channels", "format"].some((k) => sp.has(k));
  if (path === "telemetry" && v2Params && sp.get("format") === "columnar") {
    const driver = sp.get("driver");
    if (!driver) return json({ detail: "driver is required" }, 400);
    const num = (k: string) => (sp.has(k) ? Number(sp.get(k)) : undefined);
    const ch = sp.get("channels")?.split(",").filter((c): c is TelemetryChannel => (TELEMETRY_CHANNELS as readonly string[]).includes(c));
    const start = num("start_m"), end = num("end_m"), lap = num("lap");
    return json({
      meta: { year, round, session, driver, lap },
      filters_applied: { driver, lap, start_m: start ?? null, end_m: end ?? null, channels: ch ?? null, format: "columnar" },
      data: track.telemetryColumnar(driver, lap, start, end, ch),
    });
  }
  return null;
}

export function mockChaos(slug: string[], sp: URLSearchParams): Response {
  const [a, b, c, d] = slug;
  if (a === "model") return json(chaos.modelPage());
  if (a === "circuits" && b === "summary") return json(chaos.circuitsSummary());
  if (a === "circuits" && !b) return json(chaos.circuitList());
  if (a === "circuits" && c === "history") return json(chaos.circuitHistory(b));
  if (a === "drivers" && c === "profile") return json(chaos.driverProfile(b.toUpperCase()));
  if (a === "races") {
    const y = Number(b), r = Number(c);
    if (!d) return json(chaos.raceChaos(y, r));
    if (d === "drivers") return json(chaos.driversChaos(y, r));
    if (d === "laps") return json(chaos.lapsChaos(y, r, (sp.get("target") as never) ?? "sc_vsc_red"));
  }
  return json({ detail: "Not found." }, 404);
}
