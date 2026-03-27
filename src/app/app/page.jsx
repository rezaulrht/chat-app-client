"use client";
import { Suspense } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ChatDashboard from "@/components/ChatDashboard/ChatDashboard";

export default function AppPage() {
  return (
    <ProtectedRoute>
      <Suspense>
        <ChatDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}
