import { useEffect, useRef } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { SugyaTree } from "@/lib/segmentation/types";
import { useSettings } from "@/stores/settingsStore";

interface Props {
  tree: SugyaTree;
  activeId: string | null;
  onSegmentClick: (id: string) => void;
  onClose: () => void;
  onToggleSolo: () => void;
  isSolo: boolean;
}

export function GemaraReaderPanel({
  tree,
  activeId,
  onSegmentClick,
  onClose,
  onToggleSolo,
  isSolo,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const showAll = useSettings((s) => s.showAllStages);

  useEffect(() => {
    if (!activeId) return;
    const container = scrollRef.current;
    const el = container?.querySelector<HTMLElement>(`[data-sid="${activeId}"]`);
    if (!container || !el) return;
    // Only scroll the reader's own container — never the page — and only
    // when the active segment is outside the visible area.
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    const margin = 24;
    const above = eRect.top < cRect.top + margin;
    const below = eRect.bottom > cRect.bottom - margin;
    if (!above && !below) return;
    const delta = eRect.top - cRect.top - (container.clientHeight - el.clientHeight) / 2;
    container.scrollBy({ top: delta, behavior: "smooth" });
  }, [activeId]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-rule bg-card shadow-[0_30px_80px_-60px_rgba(0,0,0,0.3)]">
      <header className="flex items-center justify-between border-b border-rule bg-paper-soft/50 px-3 py-2">
        <div className="flex items-baseline gap-2">
          <span className="font-hebrew text-base text-ink">גמרא</span>
          <span className="text-[11px] uppercase tracking-wide text-ink-soft">Gemara</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={isSolo ? "Restore panels" : "Focus this panel"}
            onClick={onToggleSolo}
          >
            {isSolo ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Hide Gemara"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
        <p className="daf-gemara">
          {tree.segments.map((s, i) => {
            const m = CATEGORIES[s.category];
            const isActive = activeId === s.id;
            return (
              <span key={s.id}>
                <span
                  data-sid={s.id}
                  data-cat={s.category}
                  className={cn("gemara-segment")}
                  data-active={isActive ? "true" : "false"}
                  data-show-all={showAll ? "true" : "false"}
                  style={{ ["--seg-color" as string]: m.hex }}
                  onClick={() => onSegmentClick(s.id)}
                >
                  <span className="cb-label">{s.hebrew || "…"}</span>
                </span>
                {i < tree.segments.length - 1 && " "}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}