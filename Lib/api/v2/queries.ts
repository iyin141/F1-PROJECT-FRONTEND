import { queryOptions } from "@tanstack/react-query";
import { api, isPending } from "./client";
import type { MiniSectorScheme } from "./payloads";

/** Query options for v2 routes. `meta.persist: false` keeps them out of the IndexedDB persister. */
const NO_PERSIST = { persist: false } as const;
const poll = (data: unknown) => (isPending(data) ? 2000 : false);

export const v2Queries = {
  trackMap: (y: number, r: number, scheme: MiniSectorScheme = "distance") =>
    queryOptions({ queryKey: ["v2", "track-map", y, r, scheme], queryFn: ({ signal }) => api.trackMap(y, r, scheme, signal), staleTime: Infinity }),
  miniSectors: (y: number, r: number, drivers: string[], lap: string | number = "fastest", scheme: MiniSectorScheme = "distance") =>
    queryOptions({
      queryKey: ["v2", "mini-sectors", y, r, drivers, lap, scheme],
      queryFn: ({ signal }) => api.miniSectors(y, r, { drivers, lap, scheme }, signal),
      enabled: drivers.length > 0, refetchInterval: (q) => poll(q.state.data), meta: NO_PERSIST,
    }),
  delta: (y: number, r: number, ref: string, cmp: string, lap: string | number = "fastest") =>
    queryOptions({
      queryKey: ["v2", "delta", y, r, ref, cmp, lap], queryFn: ({ signal }) => api.delta(y, r, { ref, cmp, lap }, signal),
      enabled: !!ref && !!cmp, refetchInterval: (q) => poll(q.state.data), meta: NO_PERSIST,
    }),
  raceChaos: (y: number, r: number) =>
    queryOptions({ queryKey: ["v2", "chaos", y, r], queryFn: () => api.raceChaos(y, r), refetchInterval: (q) => poll(q.state.data) }),
  chaosModel: () => queryOptions({ queryKey: ["v2", "chaos-model"], queryFn: () => api.chaosModel() }),
};
