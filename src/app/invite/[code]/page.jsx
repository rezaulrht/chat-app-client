"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, Users, Globe, Lock } from "lucide-react";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useWorkspace } from "@/hooks/useWorkspace";
function InviteContent() {
  const { code } = useParams();
  const router = useRouter();
  const { joinViaInvite } = useWorkspace();
  const [joining, setJoining] = useState(false);
  const handleJoin = async () => {
    setJoining(true);
    try {
      const ws = await joinViaInvite(code);
      toast.success(`Joined "${ws.name}"!`);
      router.push(`/app/workspace/${ws._id}`);
    } catch (err) {
      toast.error(err.message || "Invalid or expired invite link");
    } finally {
      setJoining(false);
    }
  };
  return (
    <div className="flex h-screen w-full bg-obsidian items-center justify-center">
      <div className="glass-card rounded-3xl p-8 max-w-sm w-full mx-4 text-center space-y-5 border border-white/[0.08]">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
          <Users size={28} className="text-accent/60" />
        </div>

        <div className="space-y-1.5">
          <p className="font-display text-ivory text-lg font-bold">
            You've been invited!
          </p>

          <p className="text-ivory/30 text-sm font-mono">
            Invite code: <span className="text-accent/60">{code}</span>
          </p>
        </div>

        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full h-11 rounded-xl bg-accent/15 hover:bg-accent/25 text-accent font-display font-bold border border-accent/20 hover:border-accent/40 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {joining ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Joining...
            </>
          ) : (
            "Accept Invite"
          )}
        </button>

        <button
          onClick={() => router.push("/app")}
          className="text-ivory/20 hover:text-ivory/40 text-[12px] font-mono transition-colors"
        >
          Go to my chats instead
        </button>
      </div>
    </div>
  );
}
export default function InvitePage() {
  return (
    <ProtectedRoute>
      <InviteContent />
    </ProtectedRoute>
  );
}
