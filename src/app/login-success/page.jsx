"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function LoginSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Parse JWT to get user info (basic decode)
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(window.atob(base64));

        // Store token
        localStorage.setItem("token", token);

        // Fetch user details from backend
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((user) => {
            localStorage.setItem("user", JSON.stringify(user));
            updateUser(user);
            router.push("/chat");
          })
          .catch((error) => {
            console.error("Failed to fetch user:", error);
            router.push("/login");
          });
      } catch (error) {
        console.error("Invalid token:", error);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [searchParams, router, updateUser]);

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing login...</p>
      </div>
    </div>
  );
}
