// Two palettes — light is the default. Every component reads colors
// from the `theme` object passed down, so switching is instant.

export const THEMES = {
  light: {
  mode: "light",
  bg: "#eeeed5",
  panelBg: "#e7e4d5",
  panelBorder: "#d4d2c3",
  inputBg: "#EAE8E1",
  inputBorder: "#d4d1bd",
  text: "#70706c",
  textMuted: "#5C5B54",
  textFaint: "#8F8D82",
  accent: "#E63946",
  accent2: "#B8860B",
  monitorFrame: "#a5a7ac",
  monitorBg: "#a39f9f",
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