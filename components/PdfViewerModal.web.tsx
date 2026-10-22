import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import mammoth from "mammoth";
import { closePdf, usePdfTarget } from "@/lib/pdf-viewer";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const btn: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  background: "#fff",
  borderRadius: 8,
  padding: "4px 10px",
  fontSize: 12,
  cursor: "pointer",
};

/** In-app PDF reader for the web build, using react-pdf. */
export default function PdfViewerModal() {
  const target = usePdfTarget();
  if (!target) return null;
  if (target.kind === "docx") return <DocxViewer key={target.url} url={target.url} name={target.name} />;
  return <Viewer key={target.url} url={target.url} name={target.name} />;
}

function Viewer({ url, name }: { url: string; name: string }) {
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loaded, setLoaded] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(200, Math.floor(entry.contentRect.width))));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePdf();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      onClick={closePdf}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 16, width: "min(860px, 100%)", height: "min(92vh, 100%)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "system-ui, sans-serif" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #eee" }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
          <button style={btn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
          <span style={{ fontSize: 12, color: "#737373", minWidth: 48, textAlign: "center" }}>{pages ? `${page} / ${pages}` : "–"}</span>
          <button style={btn} disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>›</button>
          <button style={btn} onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}>−</button>
          <button style={btn} onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}>+</button>
          <button style={btn} onClick={closePdf}>Close</button>
        </div>
        <div ref={boxRef} style={{ flex: 1, overflow: "auto", background: "#f5f5f5", padding: 12 }}>
          {error ? (
            <p style={{ textAlign: "center", color: "#b91c1c", fontSize: 13 }}>{error}</p>
          ) : (
            <Document
              file={url}
              onLoadProgress={({ loaded: l, total }) => setLoaded(total ? Math.round((l * 100) / total) : 0)}
              onLoadSuccess={({ numPages }) => setPages(numPages)}
              onLoadError={(e) => setError(`Couldn't open this PDF: ${e.message}`)}
              loading={
                <div style={{ maxWidth: 260, margin: "40px auto", fontSize: 12, color: "#737373", textAlign: "center" }}>
                  Loading document…
                  <div style={{ height: 6, background: "#e5e5e5", borderRadius: 3, marginTop: 8 }}>
                    <div style={{ height: "100%", width: `${loaded}%`, background: "#000", borderRadius: 3, transition: "width .3s" }} />
                  </div>
                </div>
              }
              className="pdf-doc"
            >
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Page pageNumber={page} width={Math.round((width - 24) * zoom)} renderTextLayer={false} renderAnnotationLayer={false} />
              </div>
            </Document>
          )}
        </div>
      </div>
    </div>
  );
}

/** In-app Word reader for the web build: converted to HTML in the browser, the file goes nowhere else. */
function DocxViewer({ url, name }: { url: string; name: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await mammoth.convertToHtml({ arrayBuffer: await response.arrayBuffer() });
        setHtml(result.value);
      } catch (e) {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Unknown error");
      }
    })();
    return () => controller.abort();
  }, [url]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePdf();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      onClick={closePdf}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 16, width: "min(860px, 100%)", height: "min(92vh, 100%)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "system-ui, sans-serif" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #eee" }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
          <button style={btn} onClick={closePdf}>Close</button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 20, fontSize: 14, lineHeight: 1.6 }}>
          {error ? (
            <p style={{ textAlign: "center", color: "#b91c1c", fontSize: 13 }}>Couldn't open this document: {error}</p>
          ) : html === null ? (
            <p style={{ textAlign: "center", color: "#737373", fontSize: 12 }}>Loading document…</p>
          ) : (
            // mammoth emits a small, escaped subset of HTML (no scripts or styles).
            <div dangerouslySetInnerHTML={{ __html: html || "<p>This document has no readable text.</p>" }} />
          )}
        </div>
      </div>
    </div>
  );
}
