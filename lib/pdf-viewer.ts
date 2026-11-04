import { useSyncExternalStore } from "react";

export interface PdfViewerTarget {
  url: string;
  name: string;
  /** Defaults to "pdf". */
  kind?: "pdf" | "docx";
}

let current: PdfViewerTarget | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/** Opens the in-app PDF reader (web only; see components/PdfViewerModal.web.tsx). */
export function showPdf(target: PdfViewerTarget) {
  current = target;
  emit();
}

export function closePdf() {
  current = null;
  emit();
}

export function usePdfTarget(): PdfViewerTarget | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
    () => null,
  );
}
