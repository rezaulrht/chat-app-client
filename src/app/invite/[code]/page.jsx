"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, Users, AlertCircle } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useWorkspace } from "@/hooks/useWorkspace";
import { getGroupInitials, getGroupAvatarColor } from "@/utils/groupAvatar";

function InviteContent() {
  const { code } = useParams();
  const router = useRouter();
  const { joinViaInvite, getWorkspaceByInvite } = useWorkspace();
  
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workspaceInfo, setWorkspaceInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchInfo = async () => {
      try {
        const info = await getWorkspaceByInvite(code);
        if (isMounted) setWorkspaceInfo(info);
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || err.message || "Invalid or expired invite link");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchInfo();
    return () => {
      isMounted = false;
    };
  }, [code, getWorkspaceByInvite]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const ws = await joinViaInvite(code);
      toast.success(`Joined "${ws.name}"!`);
      router.push(`/app/workspace/${ws._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to join workspace");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-obsidian items-center justify-center">
        <Loader2 size={32} className="text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-obsidian items-center justify-center px-4 relative overflow-hidden">
      {/* Background flair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass-card rounded-3xl p-8 max-w-sm w-full text-center space-y-6 border border-white/[0.08] shadow-2xl relative z-10 backdrop-blur-xl">
        {error ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-2">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <div className="space-y-1.5">
              <h1 className="font-display text-ivory text-xl font-bold">
                Invite Invalid
              </h1>
              <p className="text-ivory/40 text-sm">
                {error}
              </p>
            </div>
          </>
        ) : workspaceInfo ? (
          <>
            <div className="space-y-4">
              <p className="text-ivory/40 text-xs font-bold uppercase tracking-widest">
                You've been invited to join
              </p>
              
              {workspaceInfo.avatar ? (
                <div className="w-20 h-20 mx-auto rounded-3xl overflow-hidden ring-4 ring-white/5 shadow-2xl relative">
                  <Image
                    src={workspaceInfo.avatar}
                    alt={workspaceInfo.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-ivory font-display font-bold text-2xl shadow-2xl ring-4 ring-white/5 ${getGroupAvatarColor(
                    workspaceInfo._id,
                  )}`}
                >
                  {getGroupInitials(workspaceInfo.name)}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <h2 className="font-display text-ivory text-2xl font-bold tracking-tight">
                {workspaceInfo.name}
              </h2>
              {workspaceInfo.description && (
                <p className="text-ivory/50 text-xs px-2 line-clamp-2">
                  {workspaceInfo.description}
                </p>
              )}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-accent/60 animate-pulse" />
                <span className="text-ivory/40 text-xs font-mono">
                  {workspaceInfo.memberCount} {workspaceInfo.memberCount === 1 ? 'member' : 'members'}
                </span>
              </div>
            </div>

            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full h-12 rounded-xl bg-accent text-black font-display font-bold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_25px_rgba(45,212,191,0.4)]"
            >
              {joining ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Joining...
                </>
              ) : (
                "Accept Invite"
              )}
            </button>
          </>
        ) : null}

        <button
          onClick={() => router.push("/app")}
          className="text-ivory/30 hover:text-ivory/60 text-[12px] font-mono transition-colors pt-2"
        >
          Return to Dashboard
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
