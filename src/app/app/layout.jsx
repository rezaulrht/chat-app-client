"use client";
import { SocketProvider } from "@/context/SocketProvider";

export default function AppLayout({ children }) {
  return <SocketProvider>{children}</SocketProvider>;
}
