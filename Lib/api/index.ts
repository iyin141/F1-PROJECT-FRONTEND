export { API_BASE_URL, BACKEND_API_URL } from "./config";
export * from "./services";
import { serverGetJson } from "@/Lib/server-client";
export { serverGetJson } from "@/Lib/server-client";

export async function fetchBackend<T = any>(pathname: string, query?: Record<string, any>): Promise<T> {
  return serverGetJson<T>(pathname, query);
}
