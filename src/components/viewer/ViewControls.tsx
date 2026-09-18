import { Link } from "@tanstack/react-router";
import { LayoutGrid, AlignLeft, Layers, Eye } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { useSettings } from "@/stores/settingsStore";
import { cn } from "@/lib/utils";

/**
 * Compact "View Controls" cluster — display-only toggles (Daf/Text mode + Show
 * All Stages). Sits in its own band above the learning surface so users read
 * it as a visual-display group, distinct from masechta navigation and the
 * translation tabs.
 */
export function ViewControls({
  mode,
  masechta,
  daf,
  amud,
  className,
}: {
  mode: "daf" | "text";
  masechta: string;
  daf: string;
  amud: string;
  className?: string;
}) {
  const showAllStages = useSettings((s) => s.showAllStages);
  const toggleShowAllStages = useSettings((s) => s.toggleShowAllStages);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 rounded-full border border-rule bg-card/80 px-2 py-1 shadow-sm",
        className,
      )}
      role="group"
      aria-label="View controls"
    >
      <span className="flex items-center gap-1 pl-2 pr-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-soft">
        <Eye className="h-3 w-3" /> View
      </span>

      <div className="flex items-center rounded-full bg-paper-soft/70 p-0.5">
        <Link
          to="/sugya/$masechta/$daf/$amud"
          params={{ masechta, daf, amud }}
          aria-pressed={mode === "daf"}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs transition-colors",
            mode === "daf"
              ? "bg-ink text-paper shadow-sm"
              : "text-ink-soft hover:text-ink",
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" /> Daf
        </Link>
        <Link
          to="/text/$masechta/$daf/$amud"
          params={{ masechta, daf, amud }}
          aria-pressed={mode === "text"}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs transition-colors",
            mode === "text"
              ? "bg-ink text-paper shadow-sm"
              : "text-ink-soft hover:text-ink",
          )}
        >
          <AlignLeft className="h-3.5 w-3.5" /> Text
        </Link>
      </div>

      <Toggle
        size="sm"
        variant="outline"
        pressed={showAllStages}
        onPressedChange={toggleShowAllStages}
        aria-label="Show all stages"
        className="h-7 rounded-full border-rule px-3 text-xs"
      >
        <Layers className="mr-1.5 h-3.5 w-3.5" />
        {showAllStages ? "All stages on" : "Show all stages"}
      </Toggle>
    </div>
  );
}