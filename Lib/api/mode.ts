/** `mock` serves v2 fixtures from the route handlers; `live` proxies to the backend. Existing endpoints are never mocked. */
export const API_MODE: "mock" | "live" = process.env.NEXT_PUBLIC_API_MODE === "mock" ? "mock" : "live";
export const isMock = () => API_MODE === "mock";
