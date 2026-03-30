"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X, Phone, Video, Pencil, Check, ExternalLink,
  Smile, Tag, ChevronRight, Bell, BellOff,
} from "lucide-react";
import { useCall } from "@/hooks/useCall";
import { useDmPrefs } from "@/hooks/useDmPrefs";

const QUICK_EMOJIS = ["❤️", "😂", "😮", "😢", "😡", "👍", "🔥", "✨", "🎉", "💯", "🙏", "😍"];
const PALETTE = [
  "#00d3bb", "#818cf8", "#f472b6", "#fb923c",
  "#34d399", "#60a5fa", "#facc15", "#e879f9",
];

export default function DMInfoPanel({ conversation, currentUser, onClose }) {
  const participant = conversation?.participant;
  const convId = conversation?._id;
  const { startCall } = useCall();
  const { prefs, update } = useDmPrefs(conversation);

  const [editingNick, setEditingNick] = useState(false);
  const [nickDraft, setNickDraft] = useState(prefs.nickname || "");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  useEffect(() => {
    setNickDraft(prefs.nickname || "");
    setEditingNick(false);
    setShowEmojiPicker(false);
    setShowPalette(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convId]);

  const saveNick = () => {
    update("nickname", nickDraft.trim());
    setEditingNick(false);
  };

  const themeColor = prefs.color || PALETTE[0];
  const chatEmoji  = prefs.emoji  || "👍";
  const muted      = !!prefs.muted;
  const displayName = prefs.nickname?.trim() || participant?.name || "User";

  return (
    <aside className="w-full sm:w-76 shrink-0 flex flex-col h-full bg-slate-surface/90 backdrop-blur-2xl md:border-l border-white/[0.08] overflow-hidden">

      {/* Header */}
      <div className="h-[68px] flex items-center justify-between px-5 border-b border-white/[0.06] shrink-0 relative">
        <span className="text-sm font-display font-bold text-ivory/80">Chat Info</span>
        <button onClick={onClose} className="w-7 h-7 rounded-xl hover:bg-white/[0.06] flex items-center justify-center text-ivory/20 hover:text-ivory/50 transition-all">
          <X size={14} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">

        {/* Avatar hero */}
        <div className="flex flex-col items-center gap-3 py-8 px-5 border-b border-white/[0.06] relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 blur-[80px] rounded-full pointer-events-none opacity-20" style={{ background: themeColor }} />

          <div className="relative z-10 group/av">
            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-offset-4 ring-offset-obsidian shadow-lg transition-transform group-hover/av:scale-105" style={{ borderColor: themeColor, "--tw-ring-color": themeColor }}>
              <Image src={participant?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant?.name}`} width={80} height={80} className="w-full h-full object-cover" alt={participant?.name || "avatar"} unoptimized />
            </div>
          </div>

          <div className="z-10 text-center">
            <p className="text-ivory font-display font-bold text-base leading-tight">{displayName}</p>
            {prefs.nickname && <p className="text-ivory/30 text-[11px] font-mono mt-0.5">{participant?.name}</p>}
          </div>

          <div className="flex gap-3 z-10 mt-1">
            {[
              { icon: Phone, label: "Voice", action: () => startCall(participant?._id, "voice") },
              { icon: Video, label: "Video", action: () => startCall(participant?._id, "video") },
            ].map(({ icon: Icon, label, action }) => (
              <button key={label} onClick={action} className="flex flex-col items-center gap-1.5 group">
                <span className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105" style={{ background: `${themeColor}22`, border: `1px solid ${themeColor}44` }}>
                  <Icon size={18} style={{ color: themeColor }} />
                </span>
                <span className="text-[9px] font-mono text-ivory/25">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Customise */}
        <div className="px-5 py-5 border-b border-white/[0.06] space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-0.5 h-3 rounded-full" style={{ background: themeColor }} />
            <p className="text-[10px] font-mono font-bold text-ivory/25 uppercase tracking-[0.15em]">Customise</p>
          </div>

          {/* Nickname */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${themeColor}22` }}>
              <Tag size={14} style={{ color: themeColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-mono text-ivory/30 mb-0.5">Nickname</p>
              {editingNick ? (
                <div className="flex items-center gap-1.5">
                  <input autoFocus value={nickDraft} onChange={(e) => setNickDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") saveNick(); if (e.key === "Escape") setEditingNick(false); }} maxLength={30} placeholder={participant?.name} className="flex-1 bg-transparent text-ivory/80 text-sm outline-none pb-0.5 placeholder:text-ivory/20" style={{ borderBottom: `1px solid ${themeColor}80` }} />
                  <button onClick={saveNick} style={{ color: themeColor }}><Check size={14} /></button>
                </div>
              ) : (
                <button onClick={() => { setNickDraft(prefs.nickname || ""); setEditingNick(true); }} className="text-ivory/60 text-sm font-medium text-left w-full flex items-center justify-between group">
                  <span className="truncate">{prefs.nickname || <span className="text-ivory/25 font-mono text-[11px]">Set nickname…</span>}</span>
                  <Pencil size={11} className="text-ivory/20 group-hover:text-accent/50 shrink-0 ml-2 transition-colors" />
                </button>
              )}
            </div>
          </div>

          {/* Chat emoji */}
          <div className="relative">
            <button onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowPalette(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all group">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${themeColor}22` }}>
                <Smile size={14} style={{ color: themeColor }} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[11px] font-mono text-ivory/30 mb-0.5">Chat Emoji</p>
                <p className="text-sm">{chatEmoji}</p>
              </div>
              <ChevronRight size={13} className="text-ivory/20 group-hover:text-ivory/40 shrink-0 transition-colors" />
            </button>
            {showEmojiPicker && (
              <div className="mx-3 mb-2 p-3 rounded-2xl bg-deep/80 backdrop-blur-xl border border-white/[0.06] shadow-2xl">
                <p className="text-[9px] font-mono text-ivory/25 uppercase tracking-widest mb-2">Pick a reaction emoji</p>
                <div className="grid grid-cols-6 gap-2">
                  {QUICK_EMOJIS.map((em) => (
                    <button key={em} onClick={() => { update("emoji", em); setShowEmojiPicker(false); }} className={`text-xl flex items-center justify-center p-1.5 rounded-xl transition-all hover:scale-110 hover:bg-white/[0.06] ${chatEmoji === em ? "scale-110 ring-1" : ""}`} style={chatEmoji === em ? { ringColor: themeColor } : {}}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chat colour */}
          <div className="relative">
            <button onClick={() => { setShowPalette(!showPalette); setShowEmojiPicker(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all group">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${themeColor}22` }}>
                <div className="w-4 h-4 rounded-full border-2 border-white/20" style={{ background: themeColor }} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[11px] font-mono text-ivory/30 mb-0.5">Chat Colour</p>
                <div className="flex gap-1 items-center">
                  <div className="w-3 h-3 rounded-full" style={{ background: themeColor }} />
                  <span className="text-[11px] font-mono text-ivory/40">{themeColor}</span>
                </div>
              </div>
              <ChevronRight size={13} className="text-ivory/20 group-hover:text-ivory/40 shrink-0 transition-colors" />
            </button>
            {showPalette && (
              <div className="mx-3 mb-2 p-3 rounded-2xl bg-deep/80 backdrop-blur-xl border border-white/[0.06] shadow-2xl">
                <p className="text-[9px] font-mono text-ivory/25 uppercase tracking-widest mb-2">Choose a colour</p>
                <div className="flex flex-wrap gap-2">
                  {PALETTE.map((c) => (
                    <button key={c} onClick={() => { update("color", c); setShowPalette(false); }} className={`w-8 h-8 rounded-xl transition-all hover:scale-110 border-2 ${themeColor === c ? "scale-110" : "border-transparent"}`} style={{ background: c, borderColor: themeColor === c ? "white" : "transparent" }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mute */}
          <button onClick={() => update("muted", !muted)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${themeColor}22` }}>
              {muted ? <BellOff size={14} style={{ color: themeColor }} /> : <Bell size={14} style={{ color: themeColor }} />}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] font-mono text-ivory/30">Notifications</p>
              <p className="text-sm text-ivory/60">{muted ? "Muted" : "On"}</p>
            </div>
            <div className="w-9 h-5 rounded-full transition-colors relative shrink-0" style={{ background: muted ? "rgba(255,255,255,0.1)" : `${themeColor}60` }}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${muted ? "left-0.5" : "left-4"}`} />
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}
