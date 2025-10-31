import { useMemo } from "react";
import { ThemeMode } from "../_types/profile";
import { useProfile } from "../_context/ProfileContext";

export type ThemePalette = {
  background: string;
  backgroundAlt: string;
  card: string;
  cardElevated: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentMuted: string;
  text: string;
  textMuted: string;
  border: string;
  borderMuted: string;
  shadow: string;
  success: string;
  warning: string;
  danger: string;
};

export type ThemeConfig = {
  palette: ThemePalette;
  gradient: readonly [string, string, string];
  buttonGradient: readonly [string, string];
  inputBackground: string;
  surfaceOverlay: string;
  chartColors: readonly string[];
};

const PALETTE_LIGHT: ThemePalette = {
  background: "#f5ede4",
  backgroundAlt: "#f0e0d2",
  card: "rgba(255, 250, 245, 0.95)",
  cardElevated: "rgba(255, 244, 234, 0.92)",
  primary: "#b07345",
  primaryDark: "#9c6235",
  primaryLight: "#dcb28b",
  accent: "#c88f5b",
  accentMuted: "#e1b892",
  text: "#4f3827",
  textMuted: "#7d6552",
  border: "rgba(215, 188, 162, 0.6)",
  borderMuted: "rgba(215, 188, 162, 0.35)",
  shadow: "rgba(178, 131, 88, 0.2)",
  success: "#8fbf7c",
  warning: "#d8a155",
  danger: "#d16a47",
};

const PALETTE_DARK: ThemePalette = {
  background: "#1b120c",
  backgroundAlt: "#24160e",
  card: "rgba(33, 21, 15, 0.94)",
  cardElevated: "rgba(38, 24, 16, 0.9)",
  primary: "#d79a63",
  primaryDark: "#c1824a",
  primaryLight: "#f1c191",
  accent: "#d6a06b",
  accentMuted: "#b9804f",
  text: "#f8efe6",
  textMuted: "#d0b59d",
  border: "rgba(189, 138, 96, 0.5)",
  borderMuted: "rgba(189, 138, 96, 0.28)",
  shadow: "rgba(0, 0, 0, 0.55)",
  success: "#9fd28a",
  warning: "#e2b974",
  danger: "#f38362",
};

const THEME_MAP: Record<ThemeMode, ThemeConfig> = {
  light: {
    palette: PALETTE_LIGHT,
    gradient: ["#fdfaf5", "#f2e1d1", "#dcbda4"],
    buttonGradient: ["#c8905b", "#aa7141"],
    inputBackground: "rgba(255, 248, 240, 0.9)",
    surfaceOverlay: "rgba(245, 229, 213, 0.55)",
    chartColors: [
      "#c98a58",
      "#a87349",
      "#d9b083",
      "#8f5f3a",
      "#c15f3f",
      "#e5c29d",
      "#b5875b",
      "#d7a96e",
      "#a56c4a",
      "#f1d7bb",
    ],
  },
  dark: {
    palette: PALETTE_DARK,
    gradient: ["#1f140e", "#150c07", "#0c0502"],
    buttonGradient: ["#d79a63", "#b87345"],
    inputBackground: "rgba(31, 20, 14, 0.82)",
    surfaceOverlay: "rgba(87, 56, 36, 0.6)",
    chartColors: [
      "#f1c191",
      "#d98a58",
      "#f07f4f",
      "#c66b41",
      "#f5a76b",
      "#d0a36d",
      "#f4bf85",
      "#d7865a",
      "#f9d3ac",
      "#c06c4b",
    ],
  },
};

export const getThemeConfig = (mode: ThemeMode): ThemeConfig =>
  THEME_MAP[mode];

export const useThemeConfig = () => {
  const { theme } = useProfile();
  return useMemo(() => getThemeConfig(theme), [theme]);
};

// Backwards compatibility exports (light theme defaults)
export const cozyGradient = THEME_MAP.light.gradient;
export const cozyPalette = THEME_MAP.light.palette;
export const cozyButtonGradient = THEME_MAP.light.buttonGradient;
export const cozyInputBackground = THEME_MAP.light.inputBackground;
export const cozySurfaceOverlay = THEME_MAP.light.surfaceOverlay;
export const cozyChartColors = THEME_MAP.light.chartColors;

export const cozyGradientDark = THEME_MAP.dark.gradient;
export const cozyPaletteDark = THEME_MAP.dark.palette;
export const cozyButtonGradientDark = THEME_MAP.dark.buttonGradient;
export const cozyInputBackgroundDark = THEME_MAP.dark.inputBackground;
export const cozySurfaceOverlayDark = THEME_MAP.dark.surfaceOverlay;
export const cozyChartColorsDark = THEME_MAP.dark.chartColors;

export const themeConfigMap = THEME_MAP;

export const getThemePalette = (mode: ThemeMode) => THEME_MAP[mode].palette;

export default THEME_MAP.light;
