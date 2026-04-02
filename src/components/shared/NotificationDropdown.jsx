"use client";

import { useState, useEffect, useRef } from "react";
import {
  Settings,
  ArrowLeft,
  Trash2,
  Heart,
  MessageCircle,
  UserPlus,
  CheckCircle2,
  MessageSquare,
  AtSign,
  PhoneMissed,
  Hash,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useNotification from "@/hooks/useNotification";

// ── Type-icon config ─────────────────────────────────────────────────────────
// Each entry: { Icon, bg (tailwind bg class), color (tailwind text class) }

const TYPE_ICON = {
  feed_follow: { Icon: UserPlus, bg: "bg-emerald-500", color: "text-white" },
  feed_reaction: { Icon: Heart, bg: "bg-pink-500", color: "text-white" },
  feed_comment: { Icon: MessageCircle, bg: "bg-blue-500", color: "text-white" },
  feed_answer_accepted: {
    Icon: CheckCircle2,
    bg: "bg-accent",
    color: "text-obsidian",
  },
  chat_message: {
    Icon: MessageSquare,
    bg: "bg-indigo-500",
    color: "text-white",
  },
  chat_mention: { Icon: AtSign, bg: "bg-violet-500", color: "text-white" },
  call_missed: { Icon: PhoneMissed, bg: "bg-red-500", color: "text-white" },
  workspace_mention: { Icon: Hash, bg: "bg-orange-500", color: "text-white" },
};

function NotifTypeBadge({ type }) {
  const cfg = TYPE_ICON[type];
  if (!cfg) return null;
  const { Icon, bg, color } = cfg;
  return (
    <span
      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${bg} ${color} flex items-center justify-center ring-2 ring-deep`}
    >
      <Icon size={8} strokeWidth={2.5} />
    </span>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatActors(actors, actorCount) {
  if (!actors || actors.length === 0) return "Someone";
  if (actors.length === 1) return actors[0].name;
  if (actors.length === 2) return `${actors[0].name} and ${actors[1].name}`;
  const others = actorCount - 2;
  return `${actors[0].name}, ${actors[1].name} and ${others} other${others > 1 ? "s" : ""}`;
}

function formatMessage(notif) {
  const a = formatActors(notif.actors, notif.actorCount);
  const map = {
    chat_message: `New message from ${a}`,
    chat_mention: `${a} mentioned you in a chat`,
    call_missed: `Missed call from ${a}`,
    feed_reaction: `${a} reacted to your post`,
    feed_comment: `${a} commented on your post`,
    feed_follow: `${a} followed you`,
    feed_answer_accepted: `Your answer was accepted on a post`,
    workspace_mention: `${a} mentioned you in #${notif.data?.moduleName || "a channel"}`,
  };
  return map[notif.type] || "New notification";
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function navigateTo(notif, router) {
  const d = notif.data || {};
  if (
    notif.type === "chat_message" ||
    notif.type === "chat_mention" ||
    notif.type === "call_missed"
  ) {
    if (d.conversationId) router.push(`/chat?conv=${d.conversationId}`);
  } else if (
    notif.type === "feed_reaction" ||
    notif.type === "feed_comment" ||
    notif.type === "feed_answer_accepted"
  ) {
    if (d.postId) router.push(`/app/feed?post=${d.postId}`);
  } else if (notif.type === "feed_follow") {
    router.push("/app/feed");
  } else if (notif.type === "workspace_mention") {
    if (d.workspaceId && d.moduleId)
      router.push(`/app/workspace/${d.workspaceId}?module=${d.moduleId}`);
  }
}

const PREF_LABELS = {
  chat_message: "Direct & Group Messages",
  chat_mention: "Chat Mentions",
  workspace_mention: "Channel Mentions",
  call_missed: "Missed Calls",
  feed_reaction: "Post Reactions",
  feed_comment: "Comments & Q&A",
  feed_follow: "New Followers",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function NotificationDropdown({ onClose }) {
  const [view, setView] = useState("list"); // "list" | "prefs"
  const [page, setPage] = useState(1);
  const listRef = useRef(null);
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    hasMore,
    prefs,
    loading,
    fetchNotifications,
    markRead,
    markAllRead,
    deleteNotif,
    updatePrefs,
  } = useNotification() || {};

  // Infinite scroll — load next page when scrolled to bottom
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    function handleScroll() {
      if (
        el.scrollTop + el.clientHeight >= el.scrollHeight - 24 &&
        hasMore &&
        !loading
      ) {
        const next = page + 1;
        setPage(next);
        fetchNotifications(next);
      }
    }
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, page, fetchNotifications]);

  function handleNotifClick(notif) {
    if (!notif.read) markRead(notif._id);
    navigateTo(notif, router);
    onClose();
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-slate-surface rounded-2xl border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.4)] overflow-hidden z-[120] flex flex-col max-h-[480px]">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
        {view === "prefs" ? (
          <>
            <button
              onClick={() => setView("list")}
              className="flex items-center gap-1.5 text-ivory/60 hover:text-ivory transition-colors text-[12px]"
            >
              <ArrowLeft size={13} /> Back
            </button>
            <p className="text-ivory text-[13px] font-display font-bold">
              Preferences
            </p>
            <div className="w-14" />
          </>
        ) : (
          <>
            <p className="text-ivory text-[13px] font-display font-bold">
              Notifications
            </p>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-accent text-[11px] font-display font-semibold hover:text-accent/80 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setView("prefs")}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-ivory/40 hover:text-ivory hover:bg-white/[0.05] transition-all"
                aria-label="Notification preferences"
              >
                <Settings size={13} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Preferences Panel ──────────────────────────────────── */}
      {view === "prefs" ? (
        <div className="p-3 flex flex-col gap-0.5 overflow-y-auto">
          {Object.entries(PREF_LABELS).map(([key, label]) => {
            const cfg = TYPE_ICON[key];
            const Icon = cfg?.Icon;
            return (
              <div
                key={key}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {Icon && (
                    <span
                      className={`w-5 h-5 rounded-lg ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0`}
                    >
                      <Icon size={10} strokeWidth={2.5} />
                    </span>
                  )}
                  <span className="text-ivory/70 text-[13px] font-display font-semibold">
                    {label}
                  </span>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-sm toggle-success"
                  checked={prefs[key] !== false}
                  onChange={(e) => updatePrefs({ [key]: e.target.checked })}
                />
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Notifications List ─────────────────────────────────── */
        <div ref={listRef} className="overflow-y-auto flex-1">
          {notifications.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-ivory/30 text-[13px] font-display font-semibold">
                No notifications yet
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleNotifClick(notif)}
                className={`group flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0 ${
                  !notif.read
                    ? "border-l-2 border-l-accent"
                    : "border-l-2 border-l-transparent"
                }`}
              >
                {/* Actor avatar + type badge */}
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/[0.08]">
                    <Image
                      src={
                        notif.actors?.[0]?.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.actors?.[0]?.name || "user"}`
                      }
                      width={36}
                      height={36}
                      alt="actor"
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <NotifTypeBadge type={notif.type} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-ivory/80 text-[12px] leading-snug">
                    {formatMessage(notif)}
                  </p>
                  <p className="text-ivory/30 text-[11px] mt-0.5 font-mono">
                    {timeAgo(notif.createdAt)}
                  </p>
                </div>

                {/* Delete button — visible on hover via group-hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotif(notif._id);
                  }}
                  className="shrink-0 w-5 h-5 rounded-lg flex items-center justify-center text-ivory/20 hover:text-red-400 hover:bg-red-500/[0.08] transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Delete notification"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-xs text-accent" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
