import React from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/** First page of a PDF, rendered with react-pdf, as the picture on a document card. */
export default function PdfThumb({ url, width, onFail }: { url: string; width: number; onFail?: () => void }) {
  return (
    <Document file={url} loading={null} error={null} onLoadError={onFail} onSourceError={onFail}>
      <Page pageNumber={1} width={width} renderTextLayer={false} renderAnnotationLayer={false} />
    </Document>
  );
}
