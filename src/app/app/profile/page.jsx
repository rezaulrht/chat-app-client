"use client";
import { Suspense } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ProfilePage } from "@/app/(site)/profile/page";

export default function AppProfilePage() {
  return (
    <ProtectedRoute>
      <div className="h-full overflow-y-auto bg-obsidian">
        <Suspense>
          <ProfilePage />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
