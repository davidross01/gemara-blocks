import { CATEGORIES, type Category } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function CategoryBadge({
  category,
  confidence,
  size = "sm",
  className,
}: {
  category: Category;
  confidence?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = CATEGORIES[category];
  const Icon = meta.icon;
  const c = confidence ?? 1;
  const tier = c >= 0.75 ? "high" : c >= 0.55 ? "med" : "low";
  return (
    <span
      data-cat={category}
      className={cn(
        "category-badge inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        className,
      )}
      style={{
        backgroundColor: `color-mix(in oklab, ${meta.hex} 12%, transparent)`,
        borderColor: `color-mix(in oklab, ${meta.hex} 40%, transparent)`,
        color: meta.hex,
      }}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      <span className="cb-label">{meta.label}</span>
      <span className="cb-label opacity-60">· {meta.english}</span>
      {confidence !== undefined && (
        <span
          aria-label={`Confidence ${(confidence * 100).toFixed(0)}%`}
          title={`Confidence ${(confidence * 100).toFixed(0)}%`}
          className={cn(
            "ml-1 inline-block h-1.5 w-1.5 rounded-full",
            tier === "low" ? "border" : "",
          )}
          style={{
            backgroundColor: tier === "high" ? meta.hex : tier === "med" ? `color-mix(in oklab, ${meta.hex} 55%, transparent)` : "transparent",
            borderColor: meta.hex,
          }}
        />
      )}
    </span>
  );
}