import SocialFeed from "@/components/SocialFeed/SocialFeed";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="h-full w-full bg-background-dark">
        <SocialFeed />
      </main>
    </ProtectedRoute>
  );
}
