import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { AnalyzedSegment } from "@/lib/segmentation/types";
import { useStudyStore, studyKey } from "@/stores/studyStore";
import { toast } from "sonner";

export function NotesPanel({
  segment,
  ref,
}: {
  segment: AnalyzedSegment | null;
  ref: string;
}) {
  const setNote = useStudyStore((s) => s.setNote);
  const notes = useStudyStore((s) => s.notes);
  const key = segment ? studyKey(ref, segment.id) : "";
  const initial = key ? notes[key] ?? "" : "";
  const [val, setVal] = useState(initial);

  useEffect(() => setVal(initial), [initial, segment?.id]);

  if (!segment) {
    return (
      <div className="rounded-xl border border-dashed border-rule p-10 text-center text-sm text-ink-soft">
        Select a segment in the daf to add your notes.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card p-4">
      <div className="mb-2 text-xs text-ink-soft">Your notes on this segment</div>
      <Textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Jot down what you noticed, a chiddush, or a question…"
        className="min-h-[200px] flex-1 resize-none"
      />
      <div className="mt-3 flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setNote(key, val);
            toast.success("Note saved");
          }}
          disabled={val === initial}
        >
          Save note
        </Button>
      </div>
    </div>
  );
}