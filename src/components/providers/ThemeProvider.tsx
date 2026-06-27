"use client";

import { useEffect } from "react";
import { usePreferences } from "@/hooks/usePreferences";
import { applyTheme } from "@/lib/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themePreference, isLoading } = usePreferences();

  useEffect(() => {
    if (isLoading) {
      applyTheme("dark");
      return;
    }

    if (document.documentElement.classList.contains("theme-interpolating")) {
      return;
    }

    applyTheme(themePreference);
  }, [themePreference, isLoading]);

  return <>{children}</>;
}
