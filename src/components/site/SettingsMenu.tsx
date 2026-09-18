import { useEffect } from "react";
import { Settings as SettingsIcon, Moon, Sun, Contrast, Scale } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/stores/settingsStore";

/**
 * Applies the global preference classes (`dark`, `cb-mode`) to the root
 * <html> element whenever settings change. Mounted once via SiteHeader.
 */
export function useApplyGlobalSettings() {
  const dark = useSettings((s) => s.darkMode);
  const cb = useSettings((s) => s.colorblindMode);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.classList.toggle("cb-mode", cb);
  }, [dark, cb]);
}

export function SettingsMenu() {
  const dark = useSettings((s) => s.darkMode);
  const cb = useSettings((s) => s.colorblindMode);
  const toggleDark = useSettings((s) => s.toggleDarkMode);
  const toggleCb = useSettings((s) => s.toggleColorblindMode);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9" aria-label="View settings">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Display</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={dark} onCheckedChange={toggleDark}>
          {dark ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
          Dark mode
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={cb} onCheckedChange={toggleCb}>
          <Contrast className="mr-2 h-4 w-4" />
          Colorblind mode
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/legal" className="cursor-pointer">
            <Scale className="mr-2 h-4 w-4" />
            Legal
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}