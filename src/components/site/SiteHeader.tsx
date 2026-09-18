import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { MasechtaNavigator } from "@/components/site/MasechtaNavigator";
import { SettingsMenu, useApplyGlobalSettings } from "@/components/site/SettingsMenu";

export function SiteHeader({
  masechta,
  daf,
  amud,
}: {
  masechta?: string;
  daf?: string;
  amud?: string;
}) {
  useApplyGlobalSettings();
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-ink">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-paper">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="font-serif text-lg font-semibold tracking-tight">
            Gemara Blocks
          </span>
        </Link>
        <div className="flex-1 overflow-x-auto">
          <MasechtaNavigator masechta={masechta} daf={daf} amud={amud} />
        </div>
        <SettingsMenu />
      </div>
    </header>
  );
}