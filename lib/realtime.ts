import { apiBaseUrl, getAccessToken } from "../backend/api-client";
import type { AppNotification, RequestMessage } from "./types";

/** What resolv-hq-backend pushes down the socket (lib/realtime.ts there). */
export type RealtimeEvent =
  | { type: "notification"; notification: AppNotification }
  | { type: "message"; requestId: string; message: RequestMessage }
  | { type: "typing"; requestId: string; userId: string; senderType: "customer" | "admin" | "agent"; typing: boolean };

const RECONNECT_MIN_MS = 1_000;
const RECONNECT_MAX_MS = 15_000;
const PING_MS = 25_000;

/**
 * Opens the app's WebSocket to the backend and keeps it open, reconnecting with
 * backoff and a fresh access token each time. The token is sent as the first
 * message rather than in the URL, so it never lands in a server log.
 * Returns a function that closes it.
 */
export function connectRealtime(onEvent: (event: RealtimeEvent) => void): () => void {
  const url = `${apiBaseUrl!.replace(/^http/, "ws")}/ws`;
  let stopped = false;
  let socket: WebSocket | null = null;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let ping: ReturnType<typeof setInterval> | undefined;
  let attempts = 0;

  const scheduleReconnect = () => {
    if (stopped) return;
    const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_MIN_MS * 2 ** attempts);
    attempts += 1;
    retry = setTimeout(open, delay);
  };

  async function open() {
    const token = await getAccessToken();
    if (stopped) return;
    if (!token) return scheduleReconnect();

    const ws = new WebSocket(url);
    socket = ws;

    ws.onopen = () => ws.send(JSON.stringify({ type: "auth", token }));
    ws.onmessage = (e) => {
      if (typeof e.data !== "string") return;
      let event: { type?: string };
      try {
        event = JSON.parse(e.data);
      } catch {
        return; // a malformed frame must not take the connection down
      }
      if (event.type === "ready") {
        attempts = 0;
        ping = setInterval(() => ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify({ type: "ping" })), PING_MS);
        return;
      }
      if (event.type === "pong") return;
      onEvent(event as RealtimeEvent);
    };
    ws.onclose = () => {
      clearInterval(ping);
      if (socket !== ws) return;
      socket = null;
      // An unauthorised close is retried too: the next attempt reads a refreshed session.
      scheduleReconnect();
    };
    ws.onerror = () => ws.close();
  }

  void open();

  return () => {
    stopped = true;
    clearTimeout(retry);
    clearInterval(ping);
    const ws = socket;
    socket = null;
    ws?.close();
  };
}
