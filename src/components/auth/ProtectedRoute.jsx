"use client";

import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in at all
        router.push("/login");
      } else if (!user.isVerified) {
        // Logged in but not verified
        router.push(`/verify?email=${encodeURIComponent(user.email)}`);
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050A] flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-[#13c8ec]"></div>
      </div>
    );
  }

  return user && user.isVerified ? children : null;
};

export default ProtectedRoute;
