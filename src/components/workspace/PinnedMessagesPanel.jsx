import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, PinOff, Loader2 } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useModule } from "@/hooks/useModule";
import api from "@/app/api/Axios";
import toast from "react-hot-toast";
import FileAttachmentDisplay from "@/components/shared/FileAttachmentDisplay";

export default function PinnedMessagesPanel({
  moduleId,
  workspaceId,
  workspace,
  onClose,
  onJumpToMessage,
}) {
  const { user } = useAuth();
  const { messages, pinMessage } = useModule();
  const { membersCache, fetchWorkspaceMembers } = useWorkspace();

  useEffect(() => {
    if (workspaceId) fetchWorkspaceMembers(workspaceId);
  }, [workspaceId, fetchWorkspaceMembers]);
  
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwner = workspace?.owner === user?._id;
  const isAdmin = workspace?.members?.find(
    (m) => String(m.user?._id) === String(user?._id) || String(m.user) === String(user?._id)
  )?.role === "admin";
  const canModifyPins = isOwner || isAdmin;

  // Fetch pinned messages
  const fetchPinnedMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/workspaces/${workspaceId}/modules/${moduleId}/pinned`);
      setPinnedMessages(res.data.pinnedMessages || []);
    } catch (err) {
      console.error("Failed to fetch pinned messages:", err);
      toast.error("Failed to load pinned messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPinnedMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  // Keep pinned messages in sync with real-time updates from ModuleProvider
  useEffect(() => {
    // If a message in `messages` is pinned/unpinned, sync it with the panel
    const updatedPinnedIds = new Set(messages.filter(m => m.isPinned).map(m => m._id));
    
    setPinnedMessages(prev => {
      // Remove unpinned
      let next = prev.filter(m => updatedPinnedIds.has(m._id));
      
      // Add new pinned from `messages` that we don't have yet (basic sync)
      const missingPinned = messages.filter(m => m.isPinned && !next.find(p => p._id === m._id));
      if (missingPinned.length > 0) {
        next = [...next, ...missingPinned];
        // Sort by pinnedAt descending (newest pin first)
        next.sort((a, b) => new Date(b.pinnedAt) - new Date(a.pinnedAt));
      }
      return next;
    });
  }, [messages]);

  const handleUnpin = async (msgId, e) => {
    e.stopPropagation();
    if (!canModifyPins) return;

    try {
      pinMessage(msgId);
      // UI will update via socket event in ModuleProvider which triggers the useEffect above
    } catch (error) {
      console.error("Failed to unpin message:", error);
      toast.error("Could not unpin message");
    }
  };

  const renderMessageText = (textArg = "", mentionsArg = [], mentionData = []) => {
    if (!textArg) return null;
    if (!mentionsArg || mentionsArg.length === 0) return textArg;

    let elements = [textArg];

    const members = membersCache?.[workspaceId] || [];

    const processedMentions = mentionsArg.map(mentionItem => {
      const userId = typeof mentionItem === "object" ? (mentionItem._id || mentionItem.id) : mentionItem;
      const smuggled = (mentionData || []).find(d => String(d.id || d._id) === String(userId));
      const memberName = (typeof mentionItem === "object" ? mentionItem.name : null) || smuggled?.name || member?.user?.name;
      const avatar = (typeof mentionItem === "object" ? mentionItem.avatar : null) || smuggled?.avatar || member?.user?.avatar;
      
      return { userId, memberName, member, avatar };
    }).filter(m => m.memberName).sort((a, b) => b.memberName.length - a.memberName.length);

    processedMentions.forEach(({ userId, memberName, member }) => {
      if (memberName) {
        const nameStr = `@${memberName}`;
        elements = elements.flatMap((el) => {
          if (typeof el !== "string") return [el];
          const parts = el.split(nameStr);
          const result = [];
          parts.forEach((part, i) => {
            result.push(part);
            if (i < parts.length - 1) {
              result.push(
                <span key={`${userId}-${i}`} className="inline-flex items-center gap-1 bg-[#5865f2]/20 text-white font-semibold px-1 py-0.5 mx-px rounded shadow-sm border border-[#5865f2]/30">
                  <Image
                    src={mention.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberName}`}
                    alt=""
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                    unoptimized
                  />
                  {nameStr}
                </span>
              );
            }
          });
          return result;
        });
      }
    });

    return elements;
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="w-80 h-full bg-deep border-l border-white/5 flex flex-col z-30 absolute right-0 top-0 shadow-2xl animate-in slide-in-from-right-8 duration-200">
      {/* Header */}
      <div className="h-14 px-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-obsidian/50 backdrop-blur-md">
        <h3 className="text-sm font-bold text-ivory">Pinned Messages</h3>
        <button
          onClick={onClose}
          className="p-1.5 text-ivory/40 hover:text-ivory hover:bg-white/5 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto w-full scrollbar-hide flex flex-col p-4 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-ivory/30 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">Loading pins...</span>
          </div>
        ) : pinnedMessages.length === 0 ? (
          <div className="text-xs text-ivory/40 text-center py-10">
            No pinned messages in this module.
          </div>
        ) : (
          pinnedMessages.map((msg) => (
            <div 
              key={msg._id} 
              className="flex gap-3 group bg-slate-surface border border-white/5 rounded-2xl p-3 hover:border-accent/30 transition-colors cursor-pointer"
              onClick={() => onJumpToMessage && onJumpToMessage(msg._id)}
            >
              <Image
                src={msg.sender?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.name}`}
                alt={msg.sender?.name || "User"}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full object-cover shrink-0 select-none"
                unoptimized
              />
              <div className="min-w-0 flex-1 relative">
                <div className="flex items-baseline gap-2 mb-1 pr-6">
                  <span className="text-[13px] font-bold text-ivory/90 truncate">
                    {msg.sender?.name}
                  </span>
                  <span className="text-[9px] font-mono text-ivory/30">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
                
                {canModifyPins && (
                  <button
                    onClick={(e) => handleUnpin(msg._id, e)}
                    className="absolute top-0 right-0 p-1 rounded-md text-ivory/30 hover:text-red-400 hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
                    title="Unpin message"
                  >
                    <PinOff size={14} />
                  </button>
                )}

                <div className="text-[12px] leading-relaxed text-ivory/80 whitespace-pre-wrap wrap-break-word">
                  {renderMessageText(msg.text, msg.mentions, msg.mentionData)}
                </div>
                {msg.attachments?.length > 0 && (
                  <div className="mt-2">
                    <FileAttachmentDisplay attachments={msg.attachments} />
                  </div>
                )}
                
                <div className="mt-2 text-[9px] font-mono text-accent/50">
                  Pinned by {msg.pinnedBy?.name || "an admin"} on {new Date(msg.pinnedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
