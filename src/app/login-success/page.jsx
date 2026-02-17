"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { oauthLogin } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      oauthLogin(token);
    } else {
      router.push("/login");
    }
  }, [searchParams, oauthLogin, router]);

  return (
    <div className="min-h-screen bg-[#05050A] flex flex-col items-center justify-center space-y-4">
      <div className="loading loading-spinner loading-lg text-[#13c8ec]"></div>
      <p className="text-slate-400 animate-pulse font-medium">
        Completing secure login...
      </p>
    </div>
  );
}
