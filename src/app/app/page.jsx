"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ChatDashboard from "@/components/ChatDashboard/ChatDashboard";

export default function AppPage() {
  return (
    <ProtectedRoute>
      <ChatDashboard />
    </ProtectedRoute>
  );
}
