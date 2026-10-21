"use client";

import { IconMoon, IconSun } from "../ui/Icons";
import { applyTheme, currentTheme } from "@/lib/theme/theme";

export function ThemeToggle() {
  function toggle() {
    const current = currentTheme();
    applyTheme(current === "dark" ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="knob pressable grid h-11 w-11 place-items-center rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      aria-label="Cambiar entre tema claro y oscuro"
    >
      <IconMoon className="h-6 w-6 dark:hidden" />
      <IconSun className="hidden h-6 w-6 dark:block" />
    </button>
  );
}
