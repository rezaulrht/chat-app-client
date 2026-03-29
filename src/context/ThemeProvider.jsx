"use client";
import { useState, useEffect } from "react";
import { ThemeContext, THEMES } from "./ThemeContext";

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("midnight-luxe-mint");

  useEffect(() => {
    const saved = localStorage.getItem("convox-theme") || "midnight-luxe-mint";
    setThemeState(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const setTheme = (id) => {
    setThemeState(id);
    localStorage.setItem("convox-theme", id);
    document.documentElement.setAttribute("data-theme", id);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}
