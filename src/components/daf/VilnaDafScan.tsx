import { useRef, useState, useEffect } from "react";
import type { AnalyzedSegment } from "@/lib/segmentation/types";
import { CATEGORIES } from "@/lib/categories";
import { useViewerStore } from "@/stores/viewerStore";
import { useSettings } from "@/stores/settingsStore";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

/**
 * Renders a scanned Vilna-style daf as a fixed canvas. The scan image is the
 * base layer and never reflows. Interactive segment overlays are positioned
 * absolutely over the Gemara region of the page; clicking one activates that
 * segment in the side panel. Rashi and Tosafos regions stay visually intact —
 * no explanatory text is ever injected into the daf.
 */
export function VilnaDafScan({
  segments,
  imageUrl,
  manuscriptTitle,
  dafLabel,
}: {
  segments: AnalyzedSegment[];
  imageUrl: string | null;
  manuscriptTitle?: string | null;
  dafLabel: string;
}) {
  const active = useViewerStore((s) => s.activeBlockId);
  const setActive = useViewerStore((s) => s.setActive);
  const showAll = useSettings((s) => s.showAllStages);
  const [loaded, setLoaded] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoaded(false);
  }, [imageUrl]);

  // Geometry of the Gemara region inside a Vilna/Bomberg daf scan.
  // Values are fractions of the rendered image (0..1). The Gemara column sits
  // in the center between Rashi (inner) and Tosafos (outer), with margins
  // top/bottom for the daf header and shoulder commentaries.
  const GEMARA = { left: 0.28, right: 0.72, top: 0.12, bottom: 0.92 } as const;

  const regionHeight = GEMARA.bottom - GEMARA.top;

  // Use the same Text View segmentation as the source of truth: each segment
  // claims a vertical share of the Gemara column proportional to its word
  // count, anchored by the segment's first and last word. This keeps Daf View
  // boundaries aligned with the logical segments rather than a separate
  // equal-slot grid.
  const wordCount = (s: string) =>
    Math.max(1, (s || "").trim().split(/\s+/).filter(Boolean).length);
  const counts = segments.map((s) => wordCount(s.hebrew));
  const totalWords = counts.reduce((a, b) => a + b, 0) || 1;
  const slots = (() => {
    const out: { top: number; height: number; firstWord: string; lastWord: string }[] = [];
    let cursor = GEMARA.top;
    segments.forEach((s, i) => {
      const share = (counts[i] / totalWords) * regionHeight;
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
  })();

  return (
    <div className="overflow-hidden rounded-2xl border border-rule bg-[#f1ead9] shadow-[0_30px_80px_-50px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between border-b border-rule/70 bg-paper/60 px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] text-ink-soft">
        <span>{dafLabel}</span>
        <span className="truncate text-[10px] normal-case tracking-normal text-ink-soft/80">
          {manuscriptTitle ?? "Tzuras hadaf"}
        </span>
      </div>

      <div ref={wrapRef} className="relative mx-auto w-full" style={{ maxWidth: 1100 }}>
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={`Scanned daf — ${dafLabel}`}
              className={cn(
                "block h-auto w-full select-none transition-opacity duration-300",
                loaded ? "opacity-100" : "opacity-0",
              )}
              draggable={false}
              onLoad={() => setLoaded(true)}
            />
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#f1ead9] text-sm text-ink-soft">
                Loading scan…
              </div>
            )}

            {/* Interactive overlay layer — absolute, never reflows the page. */}
            <div
              className="absolute inset-0"
              aria-label="Interactive sugya overlays"
              role="group"
            >
              {segments.map((s, i) => {
                const meta = CATEGORIES[s.category];
                const isActive = active === s.id;
                const slot = slots[i];
                const top = slot.top * 100;
                const height = slot.height * 100;
                const left = GEMARA.left * 100;
                const width = (GEMARA.right - GEMARA.left) * 100;
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
                      "hover:ring-2 hover:ring-offset-0 focus:outline-none focus:ring-2",
                    )}
                    style={{
                      top: `${top}%`,
                      left: `${left}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                      backgroundColor: isActive
                        ? `color-mix(in oklab, ${meta.hex} 28%, transparent)`
                        : showAll
                          ? `color-mix(in oklab, ${meta.hex} 14%, transparent)`
                          : `color-mix(in oklab, ${meta.hex} 0%, transparent)`,
                      boxShadow: isActive
                        ? `inset 0 0 0 2px color-mix(in oklab, ${meta.hex} 70%, transparent)`
                        : undefined,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `color-mix(in oklab, ${meta.hex} 18%, transparent)`;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = showAll
                          ? `color-mix(in oklab, ${meta.hex} 14%, transparent)`
                          : `color-mix(in oklab, ${meta.hex} 0%, transparent)`;
                      }
                    }}
                  />
                );
              })}
            </div>

            {/* Region guides — barely-visible outlines so learners can see
                Rashi / Gemara / Tosafos zones without altering the scan. */}
            <div className="pointer-events-none absolute inset-0">
              <RegionLabel left={0} right={GEMARA.left} top={GEMARA.top} bottom={GEMARA.bottom} label="Rashi" />
              <RegionLabel left={GEMARA.right} right={1} top={GEMARA.top} bottom={GEMARA.bottom} label="Tosafos" />
            </div>
          </>
        ) : (
          <div className="flex aspect-[3/4] flex-col items-center justify-center gap-2 bg-[#f1ead9] text-ink-soft">
            <ImageOff className="h-6 w-6" />
            <p className="text-sm">No scanned daf available for this page.</p>
            <p className="text-xs">Manuscripts API returned no image for this ref.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RegionLabel({
  left, right, top, bottom, label,
}: { left: number; right: number; top: number; bottom: number; label: string }) {
  return (
    <div
      className="absolute flex items-start justify-center"
      style={{
        left: `${left * 100}%`,
        top: `${top * 100}%`,
        width: `${(right - left) * 100}%`,
        height: `${(bottom - top) * 100}%`,
      }}
    >
      <span className="mt-1 rounded-full bg-paper/70 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-ink-soft/70">
        {label}
      </span>
    </div>
  );
}