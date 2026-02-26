import { Platform } from "react-native";

const tintColorLight = "#4DA8DA"; // light blue
const tintColorDark = "#7DD3FC";  // softer blue

export const COLORS = {
  light: {
    text: "#1F2933",
    background: "#F5FBFF",
    card: "#FFFFFF",
    tint: tintColorLight,
    icon: "#6B7280",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#3CCF91",
  },
  dark: {
    text: "#E5E7EB",
    background: "#0F172A",
    card: "#1E293B",
    tint: tintColorDark,
    primary: "#7DD3FC",
    secondary: "#3CCF91",
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
