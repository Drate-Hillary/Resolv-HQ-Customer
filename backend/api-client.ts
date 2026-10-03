import axios from "axios";
import Constants from "expo-constants";
import { supabase } from "./supabase/client";

/**
 * Base URL of resolv-hq-backend, the standalone service that now owns every
 * Supabase Postgres/Storage read and write for this app (Supabase Auth is
 * the one exception — that's still called directly via `supabase.auth.*`).
 */
const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

/**
 * In dev the backend runs on the same machine as Metro, but that machine's
 * LAN IP changes whenever the router hands out a new DHCP lease — leaving a
 * stale IP in .env.local and every request failing with "Network Error".
 * So when the configured host is a private/loopback address, swap in the host
 * Metro is currently serving from (the same machine, always current).
 */
function resolveDevBaseUrl(url: string | undefined): string | undefined {
  if (!url || !__DEV__) return url;
  const metroHost = Constants.expoConfig?.hostUri?.split(":")[0];
  if (!metroHost) return url;
  try {
    const parsed = new URL(url);
    const isLocal = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(parsed.hostname);
    if (!isLocal) return url;
    parsed.hostname = metroHost;
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
}

export const apiBaseUrl = resolveDevBaseUrl(configuredBaseUrl);

if (!apiBaseUrl) {
  throw new Error(
    "Missing EXPO_PUBLIC_API_BASE_URL. Copy .env.example to .env.local and fill in your resolv-hq-backend URL."
  );
}

/** The current Supabase access token, if any — resolv-hq-backend verifies this itself and derives the caller's role. */
export async function getAccessToken(): Promise<string | undefined> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

export const apiClient = axios.create({ baseURL: apiBaseUrl });

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Extracts resolv-hq-backend's `{ error: string }` body, falling back to axios's own message. */
export function apiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
    return err.message;
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}
