"use client";

import { IconMoon, IconSun } from "../ui/Icons";

const STORAGE_KEY = "practica-theme";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "dark" ? "#141a22" : "#d7e0ea");
  }
}

export function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="knob pressable grid h-11 w-11 place-items-center rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      aria-label="Cambiar tema"
    >
      <IconMoon className="h-6 w-6 dark:hidden" />
      <IconSun className="hidden h-6 w-6 dark:block" />
    </button>
  );
}
