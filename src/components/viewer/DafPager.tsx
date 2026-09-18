import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Target = { masechta: string; daf: string; amud: string; label: string } | null;

/**
 * Page-turn navigation that lives inline below the daf. Hebrew-flow order:
 * Next sits on the left (with a left-pointing arrow), Previous on the right
 * (with a right-pointing arrow). Disabled at masechta boundaries.
 */
export function DafPager({
  prev,
  next,
  route,
  flow = "rtl",
}: {
  prev: Target;
  next: Target;
  route: "/sugya/$masechta/$daf/$amud" | "/text/$masechta/$daf/$amud";
  flow?: "rtl" | "ltr";
}) {
  return (
    <nav
      aria-label="Daf navigation"
      className="mt-8 grid grid-cols-2 gap-3"
    >
      {flow === "rtl" ? (
        <>
          <PagerButton target={next} route={route} direction="next" />
          <PagerButton target={prev} route={route} direction="prev" />
        </>
      ) : (
        <>
          <PagerButton target={prev} route={route} direction="prev" flow="ltr" />
          <PagerButton target={next} route={route} direction="next" flow="ltr" />
        </>
      )}
    </nav>
  );
}

function PagerButton({
  target,
  route,
  direction,
  flow = "rtl",
}: {
  target: Target;
  route: "/sugya/$masechta/$daf/$amud" | "/text/$masechta/$daf/$amud";
  direction: "prev" | "next";
  flow?: "rtl" | "ltr";
}) {
  const isPrev = direction === "prev";
  // LTR flow (Text View): Previous on the left with a left arrow,
  // Next on the right with a right arrow.
  // RTL flow (Daf View): Next on the left with a left arrow,
  // Previous on the right with a right arrow.
  const onLeftEdge = flow === "ltr" ? isPrev : !isPrev;
  const baseCls = cn(
    "group flex items-center gap-2 rounded-2xl border border-rule bg-card px-3 py-3 sm:px-5 sm:py-4 transition-all duration-150 w-full sm:max-w-md",
    onLeftEdge
      ? "sm:justify-self-start text-left"
      : "sm:justify-self-end text-right",
  );

  const arrowLeft = onLeftEdge ? (
    <ArrowLeft className="h-4 w-4 text-ink-soft transition-transform group-hover:-translate-x-0.5" />
  ) : null;
  const arrowRight = !onLeftEdge ? (
    <ArrowRight className="h-4 w-4 text-ink-soft transition-transform group-hover:translate-x-0.5" />
  ) : null;

  if (!target) {
    return (
      <div
        aria-disabled="true"
        className={cn(baseCls, "cursor-not-allowed opacity-40")}
      >
        {arrowLeft}
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">
            {isPrev ? "Previous" : "Next"}
          </div>
          <div className="text-sm text-ink-soft">
            {isPrev ? "Start of masechta" : "End of masechta"}
          </div>
        </div>
        {arrowRight}
      </div>
    );
  }

  return (
    <Link
      to={route}
      params={{ masechta: target.masechta, daf: target.daf, amud: target.amud }}
      className={cn(
        baseCls,
        "hover:bg-paper-soft hover:shadow-md active:scale-[0.99]",
      )}
    >
      {arrowLeft}
      <div className="flex-1">
        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          {isPrev ? "Previous Daf" : "Next Daf"}
        </div>
        <div className="font-serif text-base text-ink">{target.label}</div>
      </div>
      {arrowRight}
    </Link>
  );
}