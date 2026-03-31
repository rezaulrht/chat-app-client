import { createContext, useContext } from "react";

export const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

export const THEMES = [
  { id: "midnight-luxe-mint", label: "Dark Mint",  mode: "dark",  surface: "#1a1a2e", accent: "#00d3bb" },
  { id: "midnight-luxe-cyan", label: "Dark Cyan",  mode: "dark",  surface: "#1a1a2e", accent: "#13c8ec" },
  { id: "luxe-mint-light",    label: "Light Mint", mode: "light", surface: "#fafaf8", accent: "#00c4ad" },
  { id: "luxe-cyan-light",    label: "Light Cyan", mode: "light", surface: "#fafaf8", accent: "#0fb8d4" },
];
