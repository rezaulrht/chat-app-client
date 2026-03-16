"use client";

import { AuthProvider } from "@/context/AuthProvider";
import LenisProvider from "@/components/LenisProvider";

export default function Providers({ children }) {
  return (
    <LenisProvider>
      <AuthProvider>{children}</AuthProvider>
    </LenisProvider>
  );
}
