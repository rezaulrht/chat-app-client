"use client";

import { AuthProvider } from "@/context/AuthProvider";

export default function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
