import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef } from "react";
import { Loader2, X, Maximize2, Minimize2 } from "lucide-react";
import { fetchCommentary, type CommentaryComment } from "@/lib/commentary.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  kind: "Rashi" | "Tosafot";
  refId: string;
  activeCommentId: string | null;
  onCommentClick: (c: CommentaryComment) => void;
  onClose: () => void;
  onToggleSolo: () => void;
  isSolo: boolean;
}

export function CommentaryPanel({
  kind,
  refId,
  activeCommentId,
  onCommentClick,
  onClose,
  onToggleSolo,
  isSolo,
}: Props) {
  const fn = useServerFn(fetchCommentary);
  const q = useQuery({
    queryKey: ["commentary", kind, refId],
    queryFn: () => fn({ data: { kind, ref: refId } }),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeCommentId) return;
    const el = scrollRef.current?.querySelector<HTMLElement>(`[data-cid="${activeCommentId}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeCommentId, q.data]);

  const label = kind === "Rashi" ? "רש״י" : "תוספות";
  const english = kind === "Rashi" ? "Rashi" : "Tosafot";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-rule bg-card shadow-[0_30px_80px_-60px_rgba(0,0,0,0.3)]">
      <header className="flex items-center justify-between border-b border-rule bg-paper-soft/50 px-3 py-2">
        <div className="flex items-baseline gap-2">
          <span className="font-hebrew text-base text-ink">{label}</span>
          <span className="text-[11px] uppercase tracking-wide text-ink-soft">{english}</span>
          {q.data && (
            <span className="text-[11px] text-ink-soft">· {q.data.comments.length}</span>
          )}
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
            aria-label={`Hide ${english}`}
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3" dir="rtl">
        {q.isLoading && (
          <div className="flex items-center justify-center py-10 text-ink-soft">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="font-sans text-sm">Loading {english}…</span>
          </div>
        )}
        {q.isError && (
          <p className="text-sm text-destructive">Couldn't load {english}: {(q.error as Error).message}</p>
        )}
        {q.data && q.data.comments.length === 0 && (
          <p className="font-sans text-sm text-ink-soft">No {english} on this daf.</p>
        )}
        {q.data && q.data.comments.length > 0 && (
          <div className="space-y-3">
            {q.data.comments.map((c) => {
              const isActive = c.id === activeCommentId;
              return (
                <button
                  key={c.id}
                  data-cid={c.id}
                  onClick={() => onCommentClick(c)}
                  className={cn(
                    "block w-full rounded-lg border px-3 py-2 text-right transition",
                    isActive
                      ? "border-ink/40 bg-paper-soft shadow-sm"
                      : "border-transparent hover:bg-paper-soft/60",
                  )}
                >
                  <p className="font-hebrew text-[0.98rem] leading-[1.85] text-ink">
                    <strong className="font-bold text-ink">{c.dh}</strong>
                    {c.body ? (
                      <>
                        {" – "}
                        <span dangerouslySetInnerHTML={{ __html: c.body }} />
                      </>
                    ) : null}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}