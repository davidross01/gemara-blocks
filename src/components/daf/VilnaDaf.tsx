import { useEffect, useRef } from "react";
import type { AnalyzedSegment } from "@/lib/segmentation/types";
import { CATEGORIES } from "@/lib/categories";
import { useViewerStore } from "@/stores/viewerStore";
import { cn } from "@/lib/utils";

/**
 * A Vilna Shas–style daf: Rashi on the inner column, Gemara in the center,
 * Tosafos on the outer column. Each Gemara segment is wrapped in a span
 * that highlights when active, with a subtle translucent overlay (no boxes).
 */
export function VilnaDaf({
  segments,
  rashi,
  tosafos,
  dafLabel,
}: {
  segments: AnalyzedSegment[];
  rashi?: string;
  tosafos?: string;
  dafLabel: string;
}) {
  const active = useViewerStore((s) => s.activeBlockId);
  const setActive = useViewerStore((s) => s.setActive);
  const refs = useRef<Record<string, HTMLSpanElement | null>>({});

  useEffect(() => {
    if (!active) return;
    const el = refs.current[active];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [active]);

  return (
    <div className="daf-page overflow-hidden rounded-2xl border border-rule shadow-[0_30px_80px_-50px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between border-b border-rule/70 px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] text-ink-soft">
        <span>{dafLabel}</span>
        <span className="font-hebrew text-base">דף</span>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)_minmax(0,1fr)]">
        {/* Rashi (inner / left visually on RTL daf — placed first column here) */}
        <aside className="daf-rashi">
          <div className="mb-1 text-[10px] uppercase tracking-widest text-ink-soft">Rashi</div>
          {rashi ? (
            <p className="whitespace-pre-line">{rashi}</p>
          ) : (
            <p className="text-ink-soft italic">Commentary unavailable for this daf.</p>
          )}
        </aside>

        {/* Gemara — center column */}
        <article className="daf-gemara">
          {segments.length === 0 ? (
            <p className="text-ink-soft" dir="ltr">Loading the daf…</p>
          ) : (
            <p>
              {segments.map((s, i) => {
                const meta = CATEGORIES[s.category];
                const isActive = active === s.id;
                return (
                  <span key={s.id}>
                    <span
                      ref={(el) => {
                        refs.current[s.id] = el;
                      }}
                      className={cn("gemara-segment")}
                      data-active={isActive}
                      style={{ ["--seg-color" as string]: meta.hex }}
                      onClick={() => setActive(s.id)}
                      onMouseEnter={() => {
                        if (!active) setActive(s.id);
                      }}
                    >
                      <span className="cb-label">{s.hebrew || "…"}</span>
                    </span>
                    {i < segments.length - 1 && " "}
                  </span>
                );
              })}
            </p>
          )}
        </article>

        {/* Tosafos (outer column) */}
        <aside className="daf-tosafos">
          <div className="mb-1 text-[10px] uppercase tracking-widest text-ink-soft">Tosafos</div>
          {tosafos ? (
            <p className="whitespace-pre-line">{tosafos}</p>
          ) : (
            <p className="text-ink-soft italic">Commentary unavailable for this daf.</p>
          )}
        </aside>
      </div>
    </div>
  );
}