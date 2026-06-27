export const THEME_CSS_VARS = [
  "--bg-primary",
  "--bg-surface",
  "--text-primary",
  "--text-secondary",
  "--text-muted",
  "--accent",
  "--thumb-bg",
  "--background",
  "--foreground",
  "--muted-foreground",
  "--surface",
  "--border",
  "--entry-surface",
  "--entry-border",
  "--entry-shadow",
  "--slate-accent",
  "--slate-accent-rail",
  "--slate-accent-rail-soft",
  "--slate-accent-title",
  "--note-surface",
  "--note-active-surface",
  "--note-active-border",
  "--spotlight-glow",
] as const;

const DARK = {
  bgPrimary: "#111111",
  bgSurface: "#171717",
  textPrimary: "#f5f5f5",
  textSecondary: "#b0b0b0",
  textMuted: "#6e6e6e",
  accent: "#d9d9d9",
  thumbBg: "#2a2a2a",
  border: "rgba(255, 255, 255, 0.06)",
};

const LIGHT = {
  bgPrimary: "#f5f5f0",
  bgSurface: "#ffffff",
  textPrimary: "#111111",
  textSecondary: "#555555",
  textMuted: "#8a8a8a",
  accent: "#3a3a3a",
  thumbBg: "#ffffff",
  border: "rgba(0, 0, 0, 0.08)",
};

function clamp01(t: number) {
  return Math.min(1, Math.max(0, t));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hexToRgb(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function lerpHex(from: string, to: string, t: number) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const r = Math.round(lerp(a.r, b.r, t));
  const g = Math.round(lerp(a.g, b.g, t));
  const bVal = Math.round(lerp(a.b, b.b, t));
  return `#${[r, g, bVal].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function lerpRgba(
  from: [number, number, number, number],
  to: [number, number, number, number],
  t: number
) {
  return `rgba(${Math.round(lerp(from[0], to[0], t))}, ${Math.round(lerp(from[1], to[1], t))}, ${Math.round(lerp(from[2], to[2], t))}, ${lerp(from[3], to[3], t).toFixed(3)})`;
}

const DARK_BORDER: [number, number, number, number] = [255, 255, 255, 0.06];
const LIGHT_BORDER: [number, number, number, number] = [0, 0, 0, 0.09];

const DARK_ENTRY_SURFACE: [number, number, number, number] = [255, 255, 255, 0.055];
const LIGHT_ENTRY_SURFACE: [number, number, number, number] = [255, 255, 255, 1];
const DARK_NOTE_SURFACE: [number, number, number, number] = [255, 255, 255, 0.03];
const LIGHT_NOTE_SURFACE: [number, number, number, number] = [0, 0, 0, 0.028];
const DARK_NOTE_ACTIVE: [number, number, number, number] = [201, 184, 150, 0.11];
const LIGHT_NOTE_ACTIVE: [number, number, number, number] = [110, 90, 62, 0.13];
const DARK_NOTE_ACTIVE_BORDER: [number, number, number, number] = [201, 184, 150, 0.24];
const LIGHT_NOTE_ACTIVE_BORDER: [number, number, number, number] = [94, 74, 50, 0.3];
const DARK_SPOTLIGHT: [number, number, number, number] = [255, 255, 255, 0.04];
const LIGHT_SPOTLIGHT: [number, number, number, number] = [94, 74, 50, 0.06];
const DARK_ENTRY_SHADOW: [number, number, number, number] = [0, 0, 0, 0.24];
const LIGHT_ENTRY_SHADOW: [number, number, number, number] = [0, 0, 0, 0.08];

const DARK_SLATE_ACCENT = "#c9b896";
const LIGHT_SLATE_ACCENT = "#6e5a3e";
const DARK_SLATE_ACCENT_RAIL = "#c9b896";
const LIGHT_SLATE_ACCENT_RAIL = "#5c4a32";
const DARK_SLATE_ACCENT_TITLE = "#ddd0b8";
const LIGHT_SLATE_ACCENT_TITLE = "#4a3d2c";

export function getInterpolatedTokens(t: number) {
  const p = clamp01(t);

  const bgPrimary = lerpHex(DARK.bgPrimary, LIGHT.bgPrimary, p);
  const bgSurface = lerpHex(DARK.bgSurface, LIGHT.bgSurface, p);
  const textPrimary = lerpHex(DARK.textPrimary, LIGHT.textPrimary, p);
  const textSecondary = lerpHex(DARK.textSecondary, LIGHT.textSecondary, p);
  const textMuted = lerpHex(DARK.textMuted, LIGHT.textMuted, p);
  const accent = lerpHex(DARK.accent, LIGHT.accent, p);
  const thumbBg = lerpHex(DARK.thumbBg, LIGHT.thumbBg, p);
  const border = lerpRgba(DARK_BORDER, LIGHT_BORDER, p);
  const entrySurface = lerpRgba(DARK_ENTRY_SURFACE, LIGHT_ENTRY_SURFACE, p);
  const entryShadow = lerpRgba(DARK_ENTRY_SHADOW, LIGHT_ENTRY_SHADOW, p);
  const noteSurface = lerpRgba(DARK_NOTE_SURFACE, LIGHT_NOTE_SURFACE, p);
  const noteActiveSurface = lerpRgba(DARK_NOTE_ACTIVE, LIGHT_NOTE_ACTIVE, p);
  const noteActiveBorder = lerpRgba(DARK_NOTE_ACTIVE_BORDER, LIGHT_NOTE_ACTIVE_BORDER, p);
  const spotlightGlow = lerpRgba(DARK_SPOTLIGHT, LIGHT_SPOTLIGHT, p);
  const slateAccent = lerpHex(DARK_SLATE_ACCENT, LIGHT_SLATE_ACCENT, p);
  const slateAccentRail = lerpHex(DARK_SLATE_ACCENT_RAIL, LIGHT_SLATE_ACCENT_RAIL, p);
  const slateAccentTitle = lerpHex(DARK_SLATE_ACCENT_TITLE, LIGHT_SLATE_ACCENT_TITLE, p);
  const slateAccentRailSoft = lerpRgba(
    [201, 184, 150, 0.44],
    [94, 74, 50, 0.36],
    p
  );
  const entryElevation = `inset 0 1px 0 rgba(255, 255, 255, ${lerp(0.06, 0.95, p).toFixed(3)}), 0 1px ${lerp(3, 4, p).toFixed(0)}px ${entryShadow}`;

  return {
    bgPrimary,
    bgSurface,
    textPrimary,
    textSecondary,
    textMuted,
    accent,
    thumbBg,
    border,
    entrySurface,
    entryShadow,
    noteSurface,
    noteActiveSurface,
    noteActiveBorder,
    spotlightGlow,
    slateAccent,
    slateAccentRail,
    slateAccentRailSoft,
    slateAccentTitle,
    entryElevation,
  };
}

export function applyThemeProgress(t: number) {
  const tokens = getInterpolatedTokens(t);
  const root = document.documentElement;

  root.classList.remove("dark", "light");
  root.classList.add("theme-interpolating");
  root.style.setProperty("--bg-primary", tokens.bgPrimary);
  root.style.setProperty("--bg-surface", tokens.bgSurface);
  root.style.setProperty("--text-primary", tokens.textPrimary);
  root.style.setProperty("--text-secondary", tokens.textSecondary);
  root.style.setProperty("--text-muted", tokens.textMuted);
  root.style.setProperty("--accent", tokens.accent);
  root.style.setProperty("--thumb-bg", tokens.thumbBg);
  root.style.setProperty("--background", tokens.bgPrimary);
  root.style.setProperty("--foreground", tokens.textPrimary);
  root.style.setProperty("--muted-foreground", tokens.textSecondary);
  root.style.setProperty("--surface", tokens.bgSurface);
  root.style.setProperty("--border", tokens.border);
  root.style.setProperty("--entry-surface", tokens.entrySurface);
  root.style.setProperty("--entry-border", tokens.border);
  root.style.setProperty("--entry-shadow", tokens.entryShadow);
  root.style.setProperty("--entry-elevation", tokens.entryElevation);
  root.style.setProperty("--note-surface", tokens.noteSurface);
  root.style.setProperty("--note-active-surface", tokens.noteActiveSurface);
  root.style.setProperty("--note-active-border", tokens.noteActiveBorder);
  root.style.setProperty("--spotlight-glow", tokens.spotlightGlow);
  root.style.setProperty("--slate-accent", tokens.slateAccent);
  root.style.setProperty("--slate-accent-rail", tokens.slateAccentRail);
  root.style.setProperty("--slate-accent-rail-soft", tokens.slateAccentRailSoft);
  root.style.setProperty("--slate-accent-title", tokens.slateAccentTitle);
  root.style.colorScheme = t >= 0.5 ? "light" : "dark";
}

export function clearInterpolatedTheme() {
  const root = document.documentElement;
  root.classList.remove("theme-interpolating");
  for (const variable of THEME_CSS_VARS) {
    root.style.removeProperty(variable);
  }
}
