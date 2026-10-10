export type ToastKind = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
  /** Milliseconds before auto-dismiss. */
  duration: number;
}

type Listener = (toasts: ToastItem[]) => void;

const MAX_VISIBLE = 3;
let nextId = 1;
let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function emit() {
  for (const l of listeners) l(toasts);
}

export function dismissToast(id: number) {
  const t = timers.get(id);
  if (t) clearTimeout(t);
  timers.delete(id);
  toasts = toasts.filter((x) => x.id !== id);
  emit();
}

function push(kind: ToastKind, title: string, description?: string, duration?: number) {
  // Collapse an identical toast that is already on screen (e.g. repeated poll failures).
  const existing = toasts.find((x) => x.kind === kind && x.title === title && x.description === description);
  if (existing) {
    const t = timers.get(existing.id);
    if (t) clearTimeout(t);
    timers.set(existing.id, setTimeout(() => dismissToast(existing.id), existing.duration));
    return existing.id;
  }

  const item: ToastItem = {
    id: nextId++,
    kind,
    title,
    description,
    duration: duration ?? (kind === "error" ? 5000 : 3000),
  };
  toasts = [...toasts, item].slice(-MAX_VISIBLE);
  timers.set(item.id, setTimeout(() => dismissToast(item.id), item.duration));
  emit();
  return item.id;
}

export function subscribeToasts(listener: Listener) {
  listeners.add(listener);
  listener(toasts);
  return () => {
    listeners.delete(listener);
  };
}

/** Imperative toast API usable from anywhere (state providers, event handlers). Render <ToastHost /> once at the root. */
export const toast = {
  success: (title: string, description?: string) => push("success", title, description),
  error: (title: string, description?: string) => push("error", title, description),
  info: (title: string, description?: string) => push("info", title, description),
};
