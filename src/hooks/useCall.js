import { useContext } from "react";
import { CallContext } from "@/context/CallContext";

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error("useCall must be used within CallProvider");
  return context;
};
