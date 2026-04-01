"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Phone,
  Video,
  Info,
  Search,
  Edit3,
  Compass,
  CheckCheck,
  Plus,
  Smile,
  Paperclip,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ACCENT   = "var(--color-accent)";
const OBSIDIAN = "var(--color-obsidian)";
const DEEP     = "var(--color-slate-surface)";
const SURFACE  = "var(--color-deep)";
const IVORY    = "var(--color-ivory)";

const TEXT_MUTED = `color-mix(in srgb, ${IVORY} 40%, transparent)`;
const TEXT_BASE  = `color-mix(in srgb, ${IVORY} 50%, transparent)`;
const TEXT_LIGHT = `color-mix(in srgb, ${IVORY} 70%, transparent)`;

const BORDER_LIGHT = `color-mix(in srgb, ${IVORY} 8%, transparent)`;
const OVERLAY_LIGHT = `color-mix(in srgb, ${IVORY} 4%, transparent)`;
const OVERLAY_MED = `color-mix(in srgb, ${IVORY} 8%, transparent)`;

const SIDEBAR_CONVERSATIONS = [
  {
    id: "c1",
    name: "Alex Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    lastMsg: "Right?? And the scheduled…",
    time: "09:42",
    online: true,
    unread: 0,
    active: true,
    isGroup: false,
  },
  {
    id: "c2",
    name: "dev-team ️",
    initials: "DT",
    groupColor: "#5865f2",
    lastMsg: "Alex: merged the PR! ",
    time: "09:38",
    online: false,
    unread: 2,
    active: false,
    isGroup: true,
  },
  {
    id: "c3",
    name: "Sarah Kim",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    lastMsg: "Can you review my PR?",
    time: "Yesterday",
    online: true,
    unread: 0,
    active: false,
    isGroup: false,
  },
  {
    id: "c4",
    name: "Jordan Lee",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
    lastMsg: "Let's sync tomorrow ",
    time: "Mon",
    online: false,
    unread: 0,
    active: false,
    isGroup: false,
  },
];

const SCRIPT_TIMINGS = [
  { step: 1, delay: 700 },
  { step: 2, delay: 1600 },
  { step: 3, delay: 2700 },
  { step: 4, delay: 3900 },
  { step: 5, delay: 4700 },
  { step: 0, delay: 7800 },
];

function WorkspaceSidebarMock() {
  return (
    <aside
      className="shrink-0 flex-col items-center gap-2 py-3 hidden md:flex"
      style={{
        width: 56,
        background: OBSIDIAN,
        borderRight: `1px solid ${BORDER_LIGHT}`,
      }}
    >
      <div className="relative mb-1">
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
          style={{ width: 3, height: 32, background: IVORY }}
        />
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: OVERLAY_MED,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="https://i.ibb.co/PG0X3Tbf/Convo-X-logo.png"
            alt="ConvoX"
            style={{ width: 22, height: "auto" }}
          />
        </div>
      </div>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          background: OVERLAY_LIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: ACCENT,
        }}
      >
        <Compass size={18} />
      </div>
      <div
        style={{
          width: 28,
          height: 1.5,
          background: BORDER_LIGHT,
          borderRadius: 99,
          margin: "4px 0",
        }}
      />
      {["M", "D"].map((letter, i) => (
        <div
          key={i}
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            background: i === 0 ? "#5865f2" : "#3ba55c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 14,
            color: IVORY,
          }}
        >
          {letter}
        </div>
      ))}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          background: OVERLAY_LIGHT,
          border: `1px solid ${BORDER_LIGHT}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "color-mix(in srgb, var(--color-accent) 53%, transparent)",
        }}
      >
        <Plus size={18} />
      </div>
    </aside>
  );
}

function SidebarMock() {
  return (
    <aside
      className="shrink-0 flex-col hidden sm:flex"
      style={{
        width: 220,
        background: DEEP,
        borderRight: `1px solid ${BORDER_LIGHT}`,
      }}
    >
      <div
        style={{
          height: 52,
          borderBottom: `1px solid ${BORDER_LIGHT}`,
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          gap: 6,
        }}
      >
        <div
          style={{
            flex: 1,
            background: OBSIDIAN,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 8px",
          }}
        >
          <Search size={11} style={{ color: TEXT_BASE }} />
          <span style={{ fontSize: 11, color: TEXT_MUTED }}>
            Find conversation
          </span>
        </div>
        <Edit3 size={13} style={{ color: TEXT_BASE }} />
      </div>
      <div style={{ padding: "10px 10px 6px" }}>
        <p
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: TEXT_MUTED,
            marginBottom: 8,
          }}
        >
          Active Now
        </p>
        <div style={{ display: "flex", gap: 8, overflowX: "hidden" }}>
          {["Alex", "Sarah"].map((name) => (
            <div
              key={name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=" + name
                  }
                  alt={name}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    outline: "1.5px solid color-mix(in srgb, var(--color-accent) 50%, transparent)",
                    outlineOffset: 1,
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: "#22c55e",
                    border: "2px solid " + DEEP,
                  }}
                />
              </div>
              <span style={{ fontSize: 9, color: TEXT_BASE }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
      <p
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: TEXT_MUTED,
          padding: "8px 14px 4px",
        }}
      >
        Direct Messages
      </p>
      <div
        style={{
          flex: 1,
          padding: "0 6px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {SIDEBAR_CONVERSATIONS.map((conv) => (
          <div
            key={conv.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 8px",
              borderRadius: 6,
              background: conv.active ? "color-mix(in srgb, var(--color-slate-surface) 70%, transparent)" : "transparent",
              position: "relative",
              cursor: "default",
            }}
          >
            {conv.active && (
              <div
                style={{
                  position: "absolute",
                  left: -6,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 3,
                  height: 24,
                  background: IVORY,
                  borderRadius: "0 3px 3px 0",
                }}
              />
            )}
            <div style={{ position: "relative", flexShrink: 0 }}>
              {conv.isGroup ? (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: conv.groupColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: IVORY,
                  }}
                >
                  {conv.initials}
                </div>
              ) : (
                <>
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    style={{ width: 28, height: 28, borderRadius: "50%" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: -1,
                      right: -1,
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: conv.online ? ACCENT : "#475569",
                      border: "2px solid " + DEEP,
                    }}
                  />
                </>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 1,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color:
                      conv.active || conv.unread > 0 ? IVORY : TEXT_BASE,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 100,
                  }}
                >
                  {conv.name}
                </span>
                {conv.unread > 0 && (
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 8,
                      fontWeight: 900,
                      color: IVORY,
                      flexShrink: 0,
                    }}
                  >
                    {conv.unread}
                  </div>
                )}
              </div>
              <p
                style={{
                  fontSize: 10,
                  color: conv.unread > 0 ? TEXT_LIGHT : TEXT_MUTED,
                  fontWeight: conv.unread > 0 ? 600 : 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {conv.lastMsg}
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function IncomingBubble({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16, scale: 0.93 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ display: "flex", alignItems: "flex-end", gap: 6 }}
    >
      <img
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
        alt="Alex"
        style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0 }}
      />
      <div
        style={{
          background: SURFACE,
          color: IVORY,
          padding: "9px 13px",
          borderRadius: "14px 14px 14px 3px",
          fontSize: 12,
          lineHeight: 1.5,
          maxWidth: 220,
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      >
        {text}
      </div>
    </motion.div>
  );
}

function OutgoingBubble({ text, showReaction, showSeen }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 0,
      }}
    >
      <motion.div
        initial={{ opacity: 0, x: 16, scale: 0.93 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          background: ACCENT,
          color: "#fff",
          padding: "9px 13px",
          borderRadius: "14px 14px 3px 14px",
          fontSize: 12,
          lineHeight: 1.5,
          maxWidth: 220,
          boxShadow: "0 4px 14px color-mix(in srgb, var(--color-accent) 20%, transparent)",
        }}
      >
        {text}
        <span style={{ fontSize: 9, opacity: 0.5, marginLeft: 8 }}>09:41</span>
      </motion.div>
      <AnimatePresence>
        {showReaction && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            style={{
              marginTop: -8,
              marginRight: 6,
              marginBottom: 4,
              background: DEEP,
              border: `1px solid ${BORDER_LIGHT}`,
              borderRadius: 99,
              padding: "2px 7px",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 3,
              zIndex: 1,
              position: "relative",
            }}
          >
            ❤️{" "}
            <span style={{ fontSize: 9, color: TEXT_BASE, fontWeight: 700 }}>
              1
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSeen && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "1px 8px",
              borderRadius: 99,
              background: "color-mix(in srgb, var(--color-accent) 13%, transparent)",
              color: ACCENT,
              fontSize: 8,
              fontWeight: 700,
            }}
          >
            <CheckCheck size={9} /> Seen
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.22 }}
      style={{ display: "flex", alignItems: "flex-end", gap: 6 }}
    >
      <img
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
        alt="Alex"
        style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0 }}
      />
      <div
        style={{
          background: SURFACE,
          padding: "10px 14px",
          borderRadius: "14px 14px 14px 3px",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            style={{
              display: "block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#64748b",
            }}
            animate={{ y: [0, -5, 0] }}
            transition={{
              repeat: Infinity,
              duration: 0.9,
              delay: i * 0.18,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function DemoSection() {
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  const [step, setStep] = useState(0);
  const timersRef = useRef([]);

  const runSequence = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    SCRIPT_TIMINGS.forEach(({ step: s, delay }) => {
      const id = setTimeout(() => {
        setStep(s);
        if (s === 0) runSequence();
      }, delay);
      timersRef.current.push(id);
    });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        frameRef.current,
        { y: 80, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
            onEnter: () => runSequence(),
          },
        },
      );
    });
    return () => {
      ctx.revert();
      timersRef.current.forEach(clearTimeout);
    };
  }, [runSequence]);

  const showMsg1 = step >= 1;
  const showMsg2 = step >= 2;
  const showTyping = step === 3;
  const showMsg3 = step >= 4;
  const showReaction = step >= 4;
  const showSeen = step >= 5;

  return (
    <section
      id="demo"
      ref={sectionRef}
      className="bg-obsidian py-24 md:py-32 px-6"
    >
      <div className="text-center mb-14 max-w-2xl mx-auto">
        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-ivory mb-4">
          See ConvoX{" "}
          <span className="font-serif italic text-accent">in Action</span>
        </h2>
        <p className="text-ivory/40 text-base md:text-lg font-light leading-relaxed">
          Real-time messaging, reactions, read receipts and more — all in one
          seamless interface.
        </p>
      </div>

      <div
        style={{ maxWidth: 860, margin: "0 auto", opacity: 0 }}
        ref={frameRef}
        className=""
      >
        <div
          className="rounded-t-3xl overflow-hidden"
          style={{
            background: DEEP,
            border: `1px solid ${BORDER_LIGHT}`,
            borderBottom: "none",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div
                key={c}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: c,
                  opacity: 0.8,
                }}
              />
            ))}
          </div>
          <div
            className="font-mono"
            style={{
              flex: 1,
              maxWidth: 320,
              background: OBSIDIAN,
              border: `1px solid ${BORDER_LIGHT}`,
              borderRadius: 8,
              padding: "5px 14px",
              fontSize: 11,
              color: TEXT_MUTED,
              textAlign: "center",
            }}
          >
            app.convox.dev/chat
          </div>
        </div>

        <div
          className="rounded-b-3xl overflow-hidden"
          style={{
            display: "flex",
            height: "clamp(320px, 60vw, 460px)",
            border: `1px solid ${BORDER_LIGHT}`,
            boxShadow:
              `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${BORDER_LIGHT}, 0 0 80px color-mix(in srgb, var(--color-accent) 7%, transparent)`,
          }}
        >
          <WorkspaceSidebarMock />
          <SidebarMock />

          <main
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: OBSIDIAN,
              minWidth: 0,
            }}
          >
            <header
              style={{
                height: 56,
                borderBottom: `1px solid ${BORDER_LIGHT}`,
                background: "color-mix(in srgb, var(--color-obsidian) 85%, transparent)",
                backdropFilter: "blur(12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 18px",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ position: "relative" }}>
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                    alt="Alex"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      outline: "2px solid color-mix(in srgb, var(--color-accent) 40%, transparent)",
                      outlineOffset: 1,
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: -1,
                      right: -1,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#22c55e",
                      border: "2px solid " + OBSIDIAN,
                    }}
                  />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: IVORY,
                      lineHeight: 1,
                    }}
                  >
                    Alex Chen
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: "#22c55e",
                      marginTop: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#22c55e",
                        display: "inline-block",
                      }}
                    />{" "}
                    Online
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[Phone, Video, Info].map((Icon, i) => (
                  <div
                    key={i}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      background: OVERLAY_LIGHT,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: TEXT_BASE,
                    }}
                  >
                    <Icon size={14} />
                  </div>
                ))}
              </div>
            </header>

            <div
              style={{
                flex: 1,
                padding: "18px 18px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                overflowY: "hidden",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: BORDER_LIGHT,
                  }}
                />
                <span
                  className="font-mono"
                  style={{
                    fontSize: 9,
                    color: TEXT_MUTED,
                    padding: "3px 10px",
                    borderRadius: 99,
                    background: OVERLAY_LIGHT,
                    border: `1px solid ${BORDER_LIGHT}`,
                    fontWeight: 500,
                  }}
                >
                  Today
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: BORDER_LIGHT,
                  }}
                />
              </div>
              <AnimatePresence>
                {showMsg1 && (
                  <IncomingBubble
                    key="msg1"
                    text="Hey! Have you tried the new ConvoX update? "
                  />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {showMsg2 && (
                  <div
                    key="msg2"
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    <OutgoingBubble
                      text="Just did — the response time is insane ⚡"
                      showReaction={showReaction}
                      showSeen={showSeen}
                    />
                  </div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {showTyping && <TypingIndicator key="typing" />}
              </AnimatePresence>
              <AnimatePresence>
                {showMsg3 && (
                  <IncomingBubble
                    key="msg3"
                    text="Right?? And the scheduled messages feature is "
                  />
                )}
              </AnimatePresence>
            </div>

            <div style={{ padding: "8px 14px 12px", flexShrink: 0 }}>
              <div
                style={{
                  background: DEEP,
                  border: `1px solid ${BORDER_LIGHT}`,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 10px",
                }}
              >
                <Paperclip
                  size={16}
                  style={{ color: TEXT_MUTED, flexShrink: 0 }}
                />
                <div
                  style={{
                    flex: 1,
                    fontSize: 12,
                    color: TEXT_MUTED,
                    padding: "2px 4px",
                  }}
                >
                  Type a message...
                </div>
                <Smile size={16} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
                <motion.div
                  animate={{
                    background: ["color-mix(in srgb, var(--color-accent) 20%, transparent)", "color-mix(in srgb, var(--color-accent) 53%, transparent)", "color-mix(in srgb, var(--color-accent) 20%, transparent)"],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    ease: "easeInOut",
                  }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={ACCENT}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22l-4-9-9-4 20-7z" />
                  </svg>
                </motion.div>
              </div>
            </div>
          </main>
        </div>

        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, ${BORDER_LIGHT}, transparent)`,
            borderRadius: 99,
            marginTop: -1,
          }}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-2.5 mt-10 max-w-[860px] mx-auto">
        {[
          "Real-time Messaging",
          "Emoji Reactions",
          "Read Receipts",
          "Typing Indicators",
          "Group Chats",
          "Scheduled Messages",
          "Message Replies",
          "GIF Support",
        ].map((feat) => (
          <span
            key={feat}
            className="px-3.5 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] text-xs text-ivory/40 font-medium font-mono tracking-wide"
          >
            {feat}
          </span>
        ))}
      </div>
    </section>
  );
}
