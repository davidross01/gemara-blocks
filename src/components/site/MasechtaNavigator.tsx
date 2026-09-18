import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MASECHTOS, getMasechta, dafList } from "@/data/masechtos";
import { toHebrewNumeral, HEBREW_AMUD } from "@/lib/hebrewNumerals";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MasechtaNavigator({
  masechta,
  daf,
  amud,
}: {
  masechta?: string;
  daf?: string;
  amud?: string;
}) {
  const navigate = useNavigate();
  const current = masechta ? getMasechta(masechta) : undefined;
  const dafs = current ? dafList(current) : [];
  const [open, setOpen] = useState(false);

  const go = (m: string, d: string, a: string) => {
    navigate({
      to: "/sugya/$masechta/$daf/$amud",
      params: { masechta: m, daf: d, amud: a },
    });
  };

  const locationLabel = current
    ? `${current.english} ${daf ?? "2"}${amud ?? "a"}`
    : "Choose Daf";

  const selectors = (
    <>
      <Select
        value={masechta ?? ""}
        onValueChange={(v) => go(v, daf ?? "2", amud ?? "a")}
      >
        <SelectTrigger className="h-10 w-full bg-card sm:h-9 sm:w-[180px]">
          <SelectValue placeholder="Masechta" />
        </SelectTrigger>
        <SelectContent className="max-h-[60vh]">
          {MASECHTOS.map((m) => (
            <SelectItem key={m.slug} value={m.slug}>
              <span className="flex items-center gap-2">
                <span>{m.english}</span>
                <span className="font-hebrew text-ink-soft">{m.hebrew}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={daf ?? ""}
        onValueChange={(v) => masechta && go(masechta, v, amud ?? "a")}
        disabled={!current}
      >
        <SelectTrigger className="h-10 w-full bg-card sm:h-9 sm:w-[170px]">
          <SelectValue placeholder="Daf" />
        </SelectTrigger>
        <SelectContent className="max-h-[60vh]">
          {dafs.map((d) => (
            <SelectItem key={d} value={String(d)}>
              <span className="flex items-center gap-2">
                <span>Daf {d}</span>
                <span dir="rtl" className="font-hebrew text-ink-soft">
                  (דף {toHebrewNumeral(d)})
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={amud ?? ""}
        onValueChange={(v) => masechta && daf && go(masechta, daf, v)}
        disabled={!current}
      >
        <SelectTrigger className="h-10 w-full bg-card sm:h-9 sm:w-[110px]">
          <SelectValue placeholder="Amud" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">
            <span className="flex items-center gap-2">
              <span>A</span>
              <span dir="rtl" className="font-hebrew text-ink-soft">({HEBREW_AMUD.a})</span>
            </span>
          </SelectItem>
          <SelectItem value="b">
            <span className="flex items-center gap-2">
              <span>B</span>
              <span dir="rtl" className="font-hebrew text-ink-soft">({HEBREW_AMUD.b})</span>
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </>
  );

  return (
    <>
      {/* Mobile: compact button + sheet */}
      <div className="sm:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3 text-left text-sm shadow-sm"
            >
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="text-[10px] uppercase tracking-wide text-ink-soft">
                  Navigate
                </span>
                <span className="truncate font-medium text-ink">{locationLabel}</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh]">
            <SheetHeader className="text-left">
              <SheetTitle>Choose Daf</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-3 pb-6">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-ink-soft">Masechta</span>
                <Select
                  value={masechta ?? ""}
                  onValueChange={(v) => go(v, daf ?? "2", amud ?? "a")}
                >
                  <SelectTrigger className="h-11 w-full bg-card">
                    <SelectValue placeholder="Masechta" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[50vh]">
                    {MASECHTOS.map((m) => (
                      <SelectItem key={m.slug} value={m.slug}>
                        <span className="flex items-center gap-2">
                          <span>{m.english}</span>
                          <span className="font-hebrew text-ink-soft">{m.hebrew}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-ink-soft">Daf</span>
                <Select
                  value={daf ?? ""}
                  onValueChange={(v) => masechta && go(masechta, v, amud ?? "a")}
                  disabled={!current}
                >
                  <SelectTrigger className="h-11 w-full bg-card">
                    <SelectValue placeholder="Daf" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[50vh]">
                    {dafs.map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        <span className="flex items-center gap-2">
                          <span>Daf {d}</span>
                          <span dir="rtl" className="font-hebrew text-ink-soft">
                            (דף {toHebrewNumeral(d)})
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-ink-soft">Amud</span>
                <Select
                  value={amud ?? ""}
                  onValueChange={(v) => {
                    if (masechta && daf) {
                      go(masechta, daf, v);
                      setOpen(false);
                    }
                  }}
                  disabled={!current}
                >
                  <SelectTrigger className="h-11 w-full bg-card">
                    <SelectValue placeholder="Amud" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a">
                      <span className="flex items-center gap-2">
                        <span>A</span>
                        <span dir="rtl" className="font-hebrew text-ink-soft">({HEBREW_AMUD.a})</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="b">
                      <span className="flex items-center gap-2">
                        <span>B</span>
                        <span dir="rtl" className="font-hebrew text-ink-soft">({HEBREW_AMUD.b})</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Tablet/Desktop: full inline selectors */}
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        {selectors}
      </div>
    </>
  );
}