import { CATEGORY_LIST } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { useSettings } from "@/stores/settingsStore";

export function Legend({ compact, className }: { compact?: boolean; className?: string }) {
  const cb = useSettings((s) => s.colorblindMode);
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {CATEGORY_LIST.map((meta) => {
        const Icon = meta.icon;
        return (
          <span
            key={meta.key}
            data-cat={meta.key}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border",
              compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
            )}
            style={{
              backgroundColor: `color-mix(in oklab, ${meta.hex} 10%, transparent)`,
              borderColor: `color-mix(in oklab, ${meta.hex} 35%, transparent)`,
              color: meta.hex,
            }}
            title={meta.description}
          >
            <Icon className="h-3 w-3" />
            {cb && (
              <span
                aria-hidden
                className="inline-block h-3 w-4 rounded-[2px] border"
                style={{
                  backgroundImage: "var(--seg-pattern)",
                  backgroundSize: "var(--seg-pattern-size)",
                  borderStyle: "var(--seg-border-style)",
                  borderColor: `color-mix(in oklab, ${meta.hex} 60%, transparent)`,
                }}
              />
            )}
            <span>{meta.label}</span>
            <span className="opacity-60">· {meta.english}</span>
          </span>
        );
      })}
    </div>
  );
}