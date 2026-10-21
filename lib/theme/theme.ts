export const THEME_KEY = "practica-theme";

export type ThemeId = "dark" | "light" | "plano";

const THEME_COLOR: Record<ThemeId, string> = {
  dark: "#2e3440",
  light: "#d5d8de",
  plano: "#ffffff",
};

export function isThemeId(value: string | null): value is ThemeId {
  return value === "dark" || value === "light" || value === "plano";
}

export function readStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (isThemeId(stored)) {
      return stored;
    }
  } catch {
    /* private mode */
  }
  return "dark";
}

export function currentTheme(): ThemeId {
  const root = document.documentElement;
  if (root.classList.contains("theme-plano")) {
    return "plano";
  }
  return root.classList.contains("dark") ? "dark" : "light";
}

export function applyTheme(theme: ThemeId) {
  const root = document.documentElement;
  root.classList.toggle("theme-plano", theme === "plano");
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme === "dark" ? "dark" : "light";
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* private mode */
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", THEME_COLOR[theme]);
  }
  window.dispatchEvent(new Event("practica-theme"));
}
