export type ThemePreference = "dark" | "light";

export function normalizeThemePreference(
  value: string | null | undefined
): ThemePreference {
  return value === "light" ? "light" : "dark";
}
