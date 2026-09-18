import type { Category } from "@/lib/categories";
import { CATEGORIES } from "@/lib/categories";

/**
 * Deterministic conceptual SVG per category — no external image needed.
 * Provides a quiet visual cue for the segment's logical role.
 */
export function BlockIllustration({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  const meta = CATEGORIES[category];
  return (
    <div
      data-cat={category}
      className={className}
      style={{
        background: `linear-gradient(135deg, color-mix(in oklab, ${meta.hex} 18%, transparent), color-mix(in oklab, ${meta.hex} 4%, transparent))`,
      }}
    >
      <svg viewBox="0 0 200 100" className="block-illustration h-full w-full" aria-hidden>
        {renderShape(category, meta.hex)}
      </svg>
    </div>
  );
}

function renderShape(c: Category, color: string) {
  switch (c) {
    case "STATEMENT":
      return (
        <g stroke={color} strokeWidth="2" fill="none">
          <line x1="40" y1="50" x2="160" y2="50" />
          <circle cx="40" cy="50" r="6" fill={color} />
        </g>
      );
    case "QUESTION":
      return (
        <g stroke={color} strokeWidth="2" fill="none">
          <path d="M60 70 Q100 30 140 70" />
          <circle cx="100" cy="80" r="3" fill={color} />
        </g>
      );
    case "ANSWER":
      return (
        <g stroke={color} strokeWidth="2" fill="none">
          <path d="M40 50 L90 70 L160 30" />
        </g>
      );
    case "PROOF":
      return (
        <g stroke={color} strokeWidth="2" fill="none">
          <rect x="50" y="35" width="100" height="30" rx="4" />
          <line x1="60" y1="50" x2="140" y2="50" />
        </g>
      );
    case "REFUTATION":
      return (
        <g stroke={color} strokeWidth="2.5" fill="none">
          <line x1="50" y1="30" x2="150" y2="70" />
          <line x1="150" y1="30" x2="50" y2="70" />
        </g>
      );
    case "DIFFICULTY":
      // A wavy line — perturbed but not broken.
      return (
        <g stroke={color} strokeWidth="2" fill="none">
          <path d="M40 50 Q60 30 80 50 T120 50 T160 50" />
        </g>
      );
    case "INQUIRY":
      // An open-topped arc with a question dot — a dilemma awaiting resolution.
      return (
        <g stroke={color} strokeWidth="2" fill="none">
          <path d="M50 65 Q100 15 150 65" strokeDasharray="3 3" />
          <circle cx="100" cy="80" r="3" fill={color} />
        </g>
      );
    case "PIVOT":
      // A branching arrow — the אלא move splits off from the prior line.
      return (
        <g stroke={color} strokeWidth="2" fill="none">
          <line x1="40" y1="50" x2="100" y2="50" />
          <line x1="100" y1="50" x2="150" y2="25" />
          <line x1="100" y1="50" x2="150" y2="75" />
          <polygon points="150,20 160,25 150,30" fill={color} />
        </g>
      );
    case "STORY":
      return (
        <g stroke={color} strokeWidth="2" fill="none">
          <path d="M40 70 Q70 30 100 50 T160 40" />
        </g>
      );
    case "ASSUMPTION":
      return (
        <g stroke={color} strokeWidth="2" strokeDasharray="4 4" fill="none">
          <line x1="40" y1="50" x2="160" y2="50" />
        </g>
      );
    case "CONCLUSION":
      return (
        <g stroke={color} strokeWidth="2" fill="none">
          <polygon points="100,25 120,60 80,60" fill={color} fillOpacity="0.2" />
          <line x1="60" y1="75" x2="140" y2="75" />
        </g>
      );
  }
}