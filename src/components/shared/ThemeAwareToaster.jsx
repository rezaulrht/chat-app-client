"use client";
import { Toaster } from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeAwareToaster() {
  const ctx = useTheme();
  const theme = ctx?.theme ?? "midnight-luxe-mint";
  const isLight = theme === "luxe-mint-light" || theme === "luxe-cyan-light";
  const isCyan = theme === "midnight-luxe-cyan" || theme === "luxe-cyan-light";
  const accent = isCyan ? "#13c8ec" : "#00d3bb";
  const bg = isLight ? "#ffffff" : "#12121a";
  const text = isLight ? "#1a1824" : "#FAF8F5";
  const border = isLight
    ? "1px solid rgba(0,0,0,0.09)"
    : `1px solid ${isCyan ? "rgba(19,200,236,0.2)" : "rgba(0,211,187,0.2)"}`;

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: { background: bg, color: text, border, borderRadius: "0.75rem" },
        success: { iconTheme: { primary: accent, secondary: bg } },
        error:   { iconTheme: { primary: "#f87171", secondary: bg } },
      }}
    />
  );
}
