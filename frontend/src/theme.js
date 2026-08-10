// Two palettes — light is the default. Every component reads colors
// from the `theme` object passed down, so switching is instant.

export const THEMES = {
  light: {
    mode: "light",
    bg: "#F7F7F5",
    panelBg: "#FFFFFF",
    panelBorder: "#E4E4E0",
    inputBg: "#FBFBFA",
    inputBorder: "#DEDEDA",
    text: "#16181C",
    textMuted: "#6B6F76",
    textFaint: "#A0A3A9",
    accent: "#E63946",
    accent2: "#B8860B",
    monitorFrame: "#0F1218",
    monitorBg: "#000000",
  },
  dark: {
    mode: "dark",
    bg: "#0C0F14",
    panelBg: "#12151C",
    panelBorder: "#232732",
    inputBg: "#151920",
    inputBorder: "#262C38",
    text: "#E8EAED",
    textMuted: "#8B93A1",
    textFaint: "#4A5160",
    accent: "#E63946",
    accent2: "#F2B705",
    monitorFrame: "#0F1218",
    monitorBg: "#000000",
  },
};