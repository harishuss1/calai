// Single source of truth for visual design tokens.
// Never inline a color, spacing, or radius value — pull it from here.

export const COLORS = {
  background: "#0a0a0a",
  card: "#1a1a1a",
  accent: "#00ff88",
  textPrimary: "#ffffff",
  textSecondary: "#888888",
  protein: "#4a9eff",
  carbs: "#ff9a3c",
  fat: "#ffd93d",
  error: "#ff4757",
  warning: "#ffb938",
  border: "#2a2a2a",
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  card: 16,
  pill: 999,
} as const;

export const FONT_SIZE = {
  sm: 13,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
} as const;
