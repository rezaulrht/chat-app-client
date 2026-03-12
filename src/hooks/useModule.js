import { useContext } from "react";
import { ModuleContext } from "@/context/ModuleContext";

export function useModule() {
  const ctx = useContext(ModuleContext);
  if (!ctx) throw new Error("useModule must be used inside ModuleProvider");
  return ctx;
}
