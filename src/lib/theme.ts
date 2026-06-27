import type { ThemePreference } from "@/types/theme";
import { clearInterpolatedTheme } from "@/lib/themeInterpolation";

const THEME_TRANSITION_MS = 280;

export function resolveTheme(preference: ThemePreference): "dark" | "light" {
  return preference;
}

export function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  const root = document.documentElement;

  clearInterpolatedTheme();
  root.classList.add("theme-transitioning");
  root.classList.remove("dark", "light");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;

  window.setTimeout(() => {
    root.classList.remove("theme-transitioning");
  }, THEME_TRANSITION_MS);
}

export function applyThemeImmediate(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  const root = document.documentElement;

  clearInterpolatedTheme();
  root.classList.remove("dark", "light", "theme-transitioning");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}
