import axios from "axios";
import { supabase } from "./supabase/client";

/**
 * Base URL of resolv-hq-backend, the standalone service that now owns every
 * Supabase Postgres/Storage read and write for this app (Supabase Auth is
 * the one exception — that's still called directly via `supabase.auth.*`).
 */
export const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

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
