import { useEffect, useMemo, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
// Vite handles the ?url import and serves the worker as a static asset.
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import { Loader2, Maximize2, Minimize2, Minus, Plus, RotateCcw } from "lucide-react";

import type { AnalyzedSegment } from "@/lib/segmentation/types";
import { CATEGORIES } from "@/lib/categories";
import { useViewerStore } from "@/stores/viewerStore";
import { useSettings } from "@/stores/settingsStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { DafPdf } from "@/data/dafPdfs";

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

let pdfJsPromise: Promise<PdfJsModule> | null = null;
async function getPdfJs() {
  if (!pdfJsPromise) {
    ensurePdfJsCollectionHelpers();
    pdfJsPromise = import("pdfjs-dist/legacy/build/pdf.mjs").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      return pdfjs;
    });
  }
  return pdfJsPromise;
}

function ensurePdfJsCollectionHelpers() {
  const define = <T extends Map<unknown, unknown> | WeakMap<object, unknown>>(proto: T) => {
    const target = proto as T & {
      getOrInsertComputed?: (key: unknown, callback: () => unknown) => unknown;
    };
    if (target.getOrInsertComputed) return;
    Object.defineProperty(target, "getOrInsertComputed", {
      configurable: true,
      value(key: unknown, callback: () => unknown) {
        if (this.has(key)) return this.get(key);
        const value = callback();
        this.set(key, value);
        return value;
      },
    });
  };

  define(Map.prototype);
  define(WeakMap.prototype);
}

/**
 * Simple in-memory cache of loaded PDF documents keyed by URL so revisiting a
 * daf inside the same masechta is instant.
 */
const pdfCache = new Map<string, Promise<PDFDocumentProxy>>();
async function loadPdf(url: string) {
  const cached = pdfCache.get(url);
  if (cached) return cached;
  const task = (async () => {
    const pdfjs = await getPdfJs();
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`PDF request failed (${response.status})`);
    const data = new Uint8Array(await response.arrayBuffer());
    return pdfjs.getDocument({
      data,
      cMapPacked: true,
      cMapUrl: "/pdfjs/cmaps/",
      standardFontDataUrl: "/pdfjs/standard_fonts/",
      wasmUrl: "/pdfjs/wasm/",
      useWorkerFetch: true,
    }).promise;
  })();
  pdfCache.set(url, task);
  return task;
}

// Gemara column geometry (fractions of the rendered page). Matches
// VilnaDafScan so overlays behave identically across viewers.
const GEMARA = { left: 0.28, right: 0.72, top: 0.12, bottom: 0.92 } as const;

export function DafPdfViewer({
  pdf,
  segments,
  dafLabel,
}: {
  pdf: DafPdf;
  segments: AnalyzedSegment[];
  dafLabel: string;
}) {
  const active = useViewerStore((s) => s.activeBlockId);
  const setActive = useViewerStore((s) => s.setActive);
  const showAll = useSettings((s) => s.showAllStages);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState<{ w: number; h: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  // Render the PDF page at high resolution whenever the URL, page, or zoom
  // changes. Rendering at devicePixelRatio * zoom keeps the page crisp.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        ensurePdfJsCollectionHelpers();
        const doc = await loadPdf(pdf.url);
        if (cancelled) return;
        const page = await doc.getPage(pdf.page);
        if (cancelled) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const scale = 1.5 * zoom * dpr;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        // HebrewBooks PDFs are scanned images stored as large XObjects. pdf.js
        // streams those image objects asynchronously; if we render before they
        // arrive we get a blank canvas plus "Dependent image isn't ready yet"
        // warnings. Forcing the operator list to resolve first guarantees every
        // image XObject for the page is fully decoded before rendering.
        await page.getOperatorList();
        if (cancelled) return;
        await page.render({ canvasContext: ctx, viewport, canvas, background: "white" }).promise;
        if (cancelled) return;
        setPageSize({ w: viewport.width / dpr, h: viewport.height / dpr });
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError((e as Error).message || "Failed to load PDF");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdf.url, pdf.page, zoom]);

  // Lock body scroll while in fullscreen so pan gestures don't move the page.
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  // Proportional segment slots — identical logic to VilnaDafScan so both
  // renderers stay in sync with Text View segmentation.
  const slots = useMemo(() => {
    const wordCount = (s: string) =>
      Math.max(1, (s || "").trim().split(/\s+/).filter(Boolean).length);
    const counts = segments.map((s) => wordCount(s.hebrew));
    const total = counts.reduce((a, b) => a + b, 0) || 1;
    const regionHeight = GEMARA.bottom - GEMARA.top;
    const out: { top: number; height: number; firstWord: string; lastWord: string }[] = [];
    let cursor = GEMARA.top;
    segments.forEach((s, i) => {
      const share = (counts[i] / total) * regionHeight;
      const words = (s.hebrew || "").trim().split(/\s+/).filter(Boolean);
      out.push({
        top: cursor,
        height: share,
        firstWord: words[0] ?? "",
        lastWord: words[words.length - 1] ?? "",
      });
      cursor += share;
    });
    return out;
  }, [segments]);

  const body = (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-rule bg-[#f1ead9] shadow-[0_30px_80px_-50px_rgba(0,0,0,0.45)]",
        fullscreen && "rounded-none border-0 shadow-none",
      )}
    >
      <div className="flex items-center justify-between border-b border-rule/70 bg-paper/60 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-ink-soft">
        <span className="truncate">{dafLabel}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}>
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-[3ch] text-center text-[10px] tabular-nums normal-case tracking-normal text-ink-soft">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Reset zoom" onClick={() => setZoom(1)}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            onClick={() => setFullscreen((f) => !f)}
          >
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={cn(
          "relative flex-1 overflow-auto",
          fullscreen ? "min-h-0" : "max-h-[80vh]",
        )}
      >
        <div className="mx-auto w-max py-4">
          <div className="relative" style={pageSize ? { width: pageSize.w, height: pageSize.h } : undefined}>
            <canvas ref={canvasRef} className="block select-none" />

            {pageSize && !loading && (
              <div className="absolute inset-0" aria-label="Interactive sugya overlays" role="group">
                {segments.map((s, i) => {
                  const meta = CATEGORIES[s.category];
                  const isActive = active === s.id;
                  const slot = slots[i];
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActive(s.id)}
                      aria-label={`Segment ${i + 1}: ${meta.label} — ${slot.firstWord}…${slot.lastWord}`}
                      title={`${meta.label} · ${slot.firstWord} … ${slot.lastWord}`}
                      data-cat={s.category}
                      data-active={isActive ? "true" : "false"}
                      data-show-all={showAll ? "true" : "false"}
                      className={cn(
                        "stage-overlay absolute cursor-pointer rounded-[3px] transition-all duration-150",
                        "hover:ring-2 focus:outline-none focus:ring-2",
                      )}
                      style={{
                        top: `${slot.top * 100}%`,
                        left: `${GEMARA.left * 100}%`,
                        width: `${(GEMARA.right - GEMARA.left) * 100}%`,
                        height: `${slot.height * 100}%`,
                        backgroundColor: isActive
                          ? `color-mix(in oklab, ${meta.hex} 28%, transparent)`
                          : showAll
                            ? `color-mix(in oklab, ${meta.hex} 14%, transparent)`
                            : "transparent",
                        boxShadow: isActive
                          ? `inset 0 0 0 2px color-mix(in oklab, ${meta.hex} 70%, transparent)`
                          : undefined,
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f1ead9]/80 text-sm text-ink-soft">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading daf…
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-destructive">
            Couldn't render the PDF page: {error}
          </div>
        )}
      </div>
    </div>
  );

  if (!fullscreen) return <div className="h-[80vh]">{body}</div>;

  return (
    <div className="fixed inset-0 z-50 bg-paper">
      {body}
    </div>
  );
}