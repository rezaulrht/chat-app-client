import ChatDashboard from "@/components/ChatDashboard/ChatDashboard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="h-screen w-full bg-obsidian">
        <ChatDashboard />
      </main>
    </ProtectedRoute>
  );
}
