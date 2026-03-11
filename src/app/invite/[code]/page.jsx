"use client";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function InvitePage() {
  const { code } = useParams();

  return (
    <ProtectedRoute>
      {/* TODO [Member 5]: Call POST /api/workspaces/join/:code, show workspace info + join button */}
      <div className="flex h-screen w-full bg-obsidian items-center justify-center">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 text-center space-y-4">
          <p className="font-display text-ivory text-lg font-bold">
            You've been invited!
          </p>
          <p className="text-ivory/30 text-sm font-mono">Invite code: {code}</p>
          <button
            disabled
            className="w-full h-11 rounded-xl bg-accent/5 text-accent/30 font-display font-bold text-sm border border-accent/10 cursor-not-allowed"
          >
            Accept Invite (coming soon)
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
