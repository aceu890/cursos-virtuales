"use client";

import { useEffect } from "react";
import { applyTheme, readStoredTheme } from "@/lib/theme/theme";

export function ThemeSync() {
  useEffect(() => {
    applyTheme(readStoredTheme());
  }, []);

  return null;
}
