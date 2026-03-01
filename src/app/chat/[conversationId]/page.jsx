import ChatDashboard from "@/components/ChatDashboard/ChatDashboard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DirectMessagePage({ params }) {
  return (
    <ProtectedRoute>
      <main className="h-full w-full bg-background-dark relative">
        <ChatDashboard />
      </main>
    </ProtectedRoute>
  );
}
