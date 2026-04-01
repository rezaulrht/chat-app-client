"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";
import {
  Sparkles, Wand2, Tag, CheckCheck,
  CalendarClock, Smile, Hash, BarChart3,
  Code2, Lightbulb, Pencil, MessageCircle,
  ChevronRight,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ACCENT  = "var(--color-accent)";
const PURPLE  = "#a78bfa";
const GREEN   = "#34d399";
const ORANGE  = "#fb923c";
const BLUE    = "#60a5fa";
const DEEP    = "var(--color-slate-surface)";
const SURFACE = "var(--color-deep)";

/* ── Venetian-blind word reveal ──────────────────────────────────────────── */
function SplitWords({ text, className = "" }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={i} style={{ overflow: "hidden", display: "inline-block", marginRight: "0.25em" }}>
          <span data-word className={`inline-block ${className}`} style={{ opacity: 0 }}>{word}</span>
        </span>
      ))}
    </>
  );
}

/* ── AI Features: tab demos ──────────────────────────────────────────────── */
const AI_REPLIES = ["Sounds great! 👍", "Let me check on that", "On it — give me 5 min"];

function SmartRepliesDemo() {
  const [accepted, setAccepted] = useState(null);
  useEffect(() => { if (accepted === null) return; const t = setTimeout(() => setAccepted(null), 2500); return () => clearTimeout(t); }, [accepted]);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg shrink-0 bg-purple-400/20 border border-purple-400/30 flex items-center justify-center text-[10px] font-bold text-purple-300">A</div>
        <div className="px-3 py-2 rounded-2xl rounded-bl-sm text-xs text-ivory/80 max-w-[220px]" style={{ background: "var(--fi-demo-bg)", border: "1px solid var(--fi-demo-border)" }}>
          Can you review the PR before EOD?
        </div>
      </div>
      <p className="text-[9px] font-mono text-ivory/25 tracking-widest uppercase flex items-center gap-1 pl-9">
        <Sparkles size={8} style={{ color: ACCENT }} /> AI suggests
      </p>
      <div className="flex flex-col gap-2 pl-9">
        {AI_REPLIES.map((r, i) => (
          <motion.button key={r} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.09 }}
            onClick={() => setAccepted(i)}
            className="text-left px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
            style={{ background: accepted === i ? "color-mix(in srgb, var(--color-accent) 13%, transparent)" : "var(--fi-bg)", border: `1px solid ${accepted === i ? "color-mix(in srgb, var(--color-accent) 27%, transparent)" : "var(--fi-border)"}`, color: accepted === i ? "var(--color-accent)" : "var(--fi-text)" }}>
            {accepted === i && <CheckCheck size={10} className="inline mr-1" style={{ color: ACCENT }} />}
            {r}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

const TONES = ["Professional", "Friendly", "Casual", "Direct"];
const REWRITES = {
  Professional: "I'd appreciate your review of the pull request at your earliest convenience.",
  Friendly:     "Hey! Would love your thoughts on the PR when you get a chance 😊",
  Casual:       "yo check the PR when u get a sec",
  Direct:       "Review the PR by EOD.",
};
function ToneDemo() {
  const [tone, setTone] = useState("Professional");
  const [show, setShow] = useState(true);
  const pick = (t) => { setTone(t); setShow(false); setTimeout(() => setShow(true), 150); };
  return (
    <div className="flex flex-col gap-3">
      <div className="px-3 py-2 rounded-xl text-xs text-ivory/40 border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>can you check the pr</div>
      <div className="flex flex-wrap gap-1.5">
        {TONES.map((t) => (
          <button key={t} onClick={() => pick(t)} className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all duration-150"
            style={{ background: tone === t ? PURPLE + "22" : "var(--fi-bg)", border: `1px solid ${tone === t ? PURPLE + "45" : "var(--fi-border)"}`, color: tone === t ? PURPLE : "var(--fi-text)" }}>
            {t}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {show && (
          <motion.div key={tone} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-3 py-2.5 rounded-xl text-xs leading-relaxed"
            style={{ background: PURPLE + "12", border: `1px solid ${PURPLE}25`, color: "rgba(250,248,245,0.8)" }}>
            <Wand2 size={9} className="inline mr-1" style={{ color: PURPLE }} />
            {REWRITES[tone]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PolishDemo() {
  const [polished, setPolished] = useState(false);
  const [loading, setLoading] = useState(false);
  const handle = () => { if (polished || loading) return; setLoading(true); setTimeout(() => { setPolished(true); setLoading(false); }, 1300); };
  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="wait">
        {!polished ? (
          <motion.div key="before" exit={{ opacity: 0 }} className="space-y-1.5">
            <div className="text-xs font-semibold text-ivory/50">why react useEffect is confusing</div>
            <div className="text-[11px] text-ivory/30 leading-snug">so it keeps running twice idk why can someone help</div>
          </motion.div>
        ) : (
          <motion.div key="after" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
            <div className="text-xs font-semibold" style={{ color: ACCENT }}>Why Does useEffect Run Twice in React 18?</div>
            <div className="text-[11px] text-ivory/55 leading-snug">API call in useEffect fires twice in dev. Is this React 18 Strict Mode behavior?</div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={handle} disabled={polished || loading}
        className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold disabled:opacity-40 transition-all duration-150"
        style={{ background: "color-mix(in srgb, var(--color-accent) 7%, transparent)", border: "1px solid color-mix(in srgb, var(--color-accent) 19%, transparent)", color: "var(--color-accent)" }}>
        {loading ? <><span className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin" /> Polishing...</>
                 : polished ? <><CheckCheck size={10} /> Polished!</>
                 : <><Sparkles size={10} /> Polish with AI</>}
      </button>
    </div>
  );
}

const TAGS = ["react-hooks", "use-effect", "react-18", "frontend", "beginner"];
function TagsDemo() {
  const [accepted, setAccepted] = useState([]);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[9px] font-mono uppercase tracking-widest text-ivory/30 flex items-center gap-1"><Tag size={8} style={{ color: ORANGE }} /> AI suggestions</p>
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <button key={tag} onClick={() => setAccepted((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag])}
            className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold transition-all duration-200"
            style={{ background: accepted.includes(tag) ? ORANGE + "22" : "rgba(255,255,255,0.04)", border: `1px solid ${accepted.includes(tag) ? ORANGE + "50" : "rgba(255,255,255,0.08)"}`, color: accepted.includes(tag) ? ORANGE : "rgba(250,248,245,0.38)" }}>
            #{tag}
          </button>
        ))}
      </div>
      {accepted.length > 0 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-mono" style={{ color: ORANGE + "99" }}>{accepted.length} tag{accepted.length > 1 ? "s" : ""} added ✓</motion.p>}
    </div>
  );
}

const AI_TABS = [
  { id: "replies",  label: "Smart Replies",  icon: Sparkles,  color: ACCENT,  tag: "Chat",  desc: "Context-aware one-tap replies generated from your last 12 messages.", Demo: SmartRepliesDemo },
  { id: "tone",    label: "Tone Rewrite",   icon: Wand2,     color: PURPLE,  tag: "Chat",  desc: "Rewrite any message in Professional, Friendly, Casual, Direct, or a custom tone.", Demo: ToneDemo },
  { id: "polish",  label: "Post Polish",    icon: Sparkles,  color: ACCENT,  tag: "Feed",  desc: "One-click AI rewrite of your post title and body — grammar, clarity, structure.", Demo: PolishDemo },
  { id: "tags",    label: "Auto Tags",      icon: Tag,       color: ORANGE,  tag: "Feed",  desc: "Up to 5 smart topic + community tags suggested from your post content.", Demo: TagsDemo },
];

function AICard({ cardRef }) {
  const [active, setActive] = useState(0);
  const tab = AI_TABS[active];
  const Demo = tab.Demo;

  return (
    <div ref={cardRef} className="relative overflow-hidden rounded-3xl p-0 glass-card"
      style={{ willChange: "transform", transformStyle: "preserve-3d", opacity: 0 }}>
      {/* Corner gradient tint */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${tab.color}0a 0%, transparent 55%)`, transition: "background 0.5s ease" }} />

      <div className="relative z-10 flex flex-col md:flex-row h-full">
        {/* Tab sidebar */}
        <div className="md:w-52 shrink-0 border-b md:border-b-0 md:border-r border-white/[0.05] p-4 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible scrollbar-hide">
          <div className="hidden md:block px-2 mb-3">
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-ivory/25">AI Features</p>
          </div>
          {AI_TABS.map((t, i) => {
            const Icon = t.icon;
            const isActive = i === active;
            return (
              <button key={t.id} onClick={() => setActive(i)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 whitespace-nowrap md:whitespace-normal border shrink-0 md:shrink"
                style={{ background: isActive ? t.color + "14" : "var(--fi-bg)", border: `1px solid ${isActive ? t.color + "35" : "var(--fi-border)"}`, color: isActive ? t.color : "var(--fi-text-3)" }}>
                <Icon size={14} style={{ flexShrink: 0 }} />
                <span className="text-[12px] font-display font-semibold">{t.label}</span>
                <span className="ml-auto text-[8px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded-md hidden md:inline-flex"
                  style={{ background: isActive ? t.color + "20" : "var(--fi-bg)", color: isActive ? t.color : "var(--fi-text-2)" }}>
                  {t.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Demo pane */}
        <div className="flex-1 p-6 md:p-8 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div key={tab.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.28 }} className="flex flex-col flex-1 gap-4">
              <div>
                <h3 className="font-display font-bold text-ivory text-xl mb-1">{tab.label}</h3>
                <p className="text-ivory/40 text-sm leading-relaxed">{tab.desc}</p>
              </div>
              <div className="rounded-2xl flex-1 p-5" style={{ background: "var(--fi-demo-bg)", border: "1px solid var(--fi-demo-border)" }}>
                <Demo />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── Developer Feed card ─────────────────────────────────────────────────── */
const POST_TYPES = [
  { label: "Post",     icon: MessageCircle, color: ACCENT,   desc: "Share ideas, updates, or articles with the community." },
  { label: "Snippet",  icon: Code2,         color: BLUE,     desc: "Syntax-highlighted code in 12+ languages." },
  { label: "Question", icon: Lightbulb,     color: ORANGE,   desc: "Ask the community and get expert answers fast." },
  { label: "TIL",      icon: Lightbulb,     color: GREEN,    desc: "Quick \"Today I Learned\" insights — short and punchy." },
  { label: "Poll",     icon: BarChart3,     color: PURPLE,   desc: "Community votes with custom duration and visibility." },
  { label: "Showcase", icon: Sparkles,      color: "#f472b6", desc: "Highlight your project with a URL and thumbnail." },
];

function FeedCard({ cardRef }) {
  const [active, setActive] = useState(0);
  const { label, icon: Icon, color, desc } = POST_TYPES[active];
  useEffect(() => { const id = setInterval(() => setActive((i) => (i + 1) % POST_TYPES.length), 2200); return () => clearInterval(id); }, []);

  return (
    <div ref={cardRef} className="relative overflow-hidden rounded-3xl p-7 glass-card"
      style={{ willChange: "transform", transformStyle: "preserve-3d", opacity: 0 }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${color}08, transparent 60%)`, transition: "background 0.6s ease" }} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: BLUE + "18", border: `1px solid ${BLUE}28` }}>
            <Hash size={17} style={{ color: BLUE }} />
          </div>
          <div>
            <h3 className="font-display font-bold text-ivory text-base">Developer Feed</h3>
            <p className="text-ivory/30 text-[10px] font-mono">6 post types, markdown, AI tools</p>
          </div>
        </div>
        <p className="text-ivory/40 text-sm leading-relaxed mb-5">
          A community feed built for developers — share code, ask questions, run polls, and showcase projects.
        </p>

        {/* Post type grid */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {POST_TYPES.map(({ label: l, icon: Ic, color: c }, i) => (
            <button key={l} onClick={() => setActive(i)}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all duration-250 border"
              style={{ background: active === i ? c + "16" : "var(--fi-bg)", border: `1px solid ${active === i ? c + "40" : "var(--fi-border)"}` }}>
              <Ic size={16} style={{ color: active === i ? c : "var(--fi-text-2)" }} />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wide" style={{ color: active === i ? c : "var(--fi-text)" }}>{l}</span>
            </button>
          ))}
        </div>

        {/* Active type description */}
        <AnimatePresence mode="wait">
          <motion.div key={label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="rounded-2xl px-4 py-3 flex items-center gap-3 mt-auto"
            style={{ background: color + "0e", border: `1px solid ${color}22` }}>
            <Icon size={16} style={{ color, flexShrink: 0 }} />
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: color + "88" }}>Creating: {label}</p>
              <p className="text-xs text-ivory/50 leading-snug">{desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Chat Superpowers card ───────────────────────────────────────────────── */
const CHAT_TABS = [
  {
    id: "scheduled", label: "Scheduled", icon: CalendarClock, color: GREEN,
    desc: "Queue messages to send at any future date and time. Cancel or view from the panel.",
    demo: (
      <div className="space-y-2">
        {[{ time: "Mon 09:00", msg: "Stand-up reminder 🔔", color: GREEN }, { time: "Tue 14:30", msg: "Deploy notification ✅", color: GREEN }].map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "var(--fi-msg-bg)", border: "1px solid var(--fi-msg-border)" }}>
            <CalendarClock size={12} style={{ color: GREEN, flexShrink: 0 }} />
            <span className="text-[10px] font-mono text-ivory/40 shrink-0">{item.time}</span>
            <span className="text-xs text-ivory/65 flex-1 truncate">{item.msg}</span>
          </div>
        ))}
        <p className="text-[9px] font-mono text-center pt-1" style={{ color: GREEN + "60" }}>2 messages queued</p>
      </div>
    ),
  },
  {
    id: "reactions", label: "Reactions", icon: Smile, color: PURPLE,
    desc: "Emoji reactions, GIF picker, :shorthand: emoji codes, and inline autocomplete.",
    demo: (
      <div className="flex flex-wrap gap-2 justify-center py-3">
        {["❤️ 3", "🚀 5", "😂 2", "👀 4", "🔥 7", "✅ 1", "🎉 3", "💯 2"].map((r) => (
          <span key={r} className="px-2.5 py-1.5 rounded-full text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
            style={{ background: PURPLE + "15", border: `1px solid ${PURPLE}30`, color: "rgba(250,248,245,0.7)" }}>{r}</span>
        ))}
      </div>
    ),
  },
  {
    id: "control", label: "Message Control", icon: Pencil, color: ORANGE,
    desc: "Edit or delete any message any time. Thread replies keep group chats focused.",
    demo: (
      <div className="space-y-2">
        {[{ label: "Edit message", sub: "No time limit ever", color: ORANGE }, { label: "Delete globally", sub: "Full history control", color: "#f87171" }, { label: "Thread reply", sub: "Keep context clean", color: ACCENT }].map(({ label, sub, color }) => (
          <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: color + "08", border: `1px solid ${color}18` }}>
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
            <div>
              <p className="text-xs font-semibold text-ivory/70">{label}</p>
              <p className="text-[10px] text-ivory/30 font-mono">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

function ChatCard({ cardRef }) {
  const [active, setActive] = useState(0);
  const tab = CHAT_TABS[active];

  return (
    <div ref={cardRef} className="relative overflow-hidden rounded-3xl p-7 glass-card"
      style={{ willChange: "transform", transformStyle: "preserve-3d", opacity: 0 }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${tab.color}08, transparent 55%)`, transition: "background 0.4s ease" }} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "color-mix(in srgb, var(--color-accent) 9%, transparent)", border: "1px solid color-mix(in srgb, var(--color-accent) 16%, transparent)" }}>
            <MessageCircle size={17} style={{ color: ACCENT }} />
          </div>
          <div>
            <h3 className="font-display font-bold text-ivory text-base">Chat Superpowers</h3>
            <p className="text-ivory/30 text-[10px] font-mono">Real-time · Expressive · In control</p>
          </div>
        </div>
        <p className="text-ivory/40 text-sm leading-relaxed mb-5">
          Everything that makes ConvoX chat feel alive — scheduled sends, rich reactions, and full message control.
        </p>

        {/* Tab pills */}
        <div className="flex gap-2 mb-5">
          {CHAT_TABS.map((t, i) => {
            const Icon = t.icon;
            const isActive = i === active;
            return (
              <button key={t.id} onClick={() => setActive(i)}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-200 border text-center"
                style={{ background: isActive ? t.color + "16" : "var(--fi-bg)", border: `1px solid ${isActive ? t.color + "38" : "var(--fi-border)"}` }}>
                <Icon size={14} style={{ color: isActive ? t.color : "var(--fi-text-2)" }} />
                <span className="text-[9px] font-mono uppercase tracking-wide" style={{ color: isActive ? t.color : "var(--fi-text-2)" }}>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Demo content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="flex flex-col gap-3 flex-1">
            <p className="text-xs text-ivory/40 leading-relaxed">{tab.desc}</p>
            <div className="rounded-2xl p-4 flex-1" style={{ background: "var(--fi-demo-bg)", border: "1px solid var(--fi-demo-border)" }}>
              {tab.demo}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── MAIN SECTION ─────────────────── */
const CARD_FROM = [
  { x: 0,   y: -60, rotateX:  10, rotateY: 0  },
  { x: -50, y: 30,  rotateX:  -6, rotateY: -8 },
  { x: 50,  y: 30,  rotateX:  -6, rotateY:  8 },
];

export default function Features() {
  const sectionRef  = useRef(null);
  const headRef     = useRef(null);
  const subtitleRef = useRef(null);
  const lineRef     = useRef(null);
  const orbRef      = useRef(null);
  const card0       = useRef(null);
  const card1       = useRef(null);
  const card2       = useRef(null);
  const velRef      = useRef(0);
  const rafRef      = useRef(null);

  useLenis(({ velocity }) => { velRef.current = velocity; });

  /* Ambient drifting orb */
  useEffect(() => {
    let ox = 20, oy = 30, vx = 0.09, vy = 0.065;
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const v = Math.abs(velRef.current);
      const s = 1 + v * 0.14;
      ox += vx * s; oy += vy * s - v * 0.012;
      if (ox < 5 || ox > 75) vx *= -1;
      if (oy < 5 || oy > 75) vy *= -1;
      if (orbRef.current) {
        orbRef.current.style.background =
          `radial-gradient(circle at ${ox}% ${oy}%, rgba(0,211,187,0.08) 0%, rgba(0,211,187,0.02) 40%, transparent 70%)`;
      }
    };
    tick();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);


  /* GSAP scroll animations */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Tag line */
      gsap.fromTo(headRef.current?.querySelector(".section-tag"),
        { opacity: 0, y: 18, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.75, ease: "power3.out",
          scrollTrigger: { trigger: headRef.current, start: "top 82%" } });

      /* Heading words venetian-blind */
      const words = headRef.current?.querySelectorAll("[data-word]");
      if (words) {
        gsap.fromTo(words, { y: "108%", opacity: 0 },
          { y: "0%", opacity: 1, duration: 0.7, stagger: 0.065, ease: "power3.out",
            scrollTrigger: { trigger: headRef.current, start: "top 78%" } });
      }

      /* Subtitle */
      gsap.fromTo(subtitleRef.current,
        { opacity: 0, y: 18, filter: "blur(5px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: headRef.current, start: "top 74%" } });

      /* Draw-on separator line (scrubbed) */
      gsap.fromTo(lineRef.current, { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, ease: "power2.inOut",
          scrollTrigger: { trigger: lineRef.current, start: "top 85%", end: "top 58%", scrub: 1.5 } });

      /* Per-card directional 3D entries */
      [card0, card1, card2].forEach(({ current: card }, i) => {
        if (!card) return;
        const from = CARD_FROM[i];
        gsap.fromTo(card, { ...from, opacity: 0, transformPerspective: 1100, scale: 0.92 },
          { x: 0, y: 0, opacity: 1, rotateX: 0, rotateY: 0, scale: 1,
            duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%", once: true },
            delay: i * 0.1 });
      });


    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="relative bg-obsidian py-28 md:py-40 px-6 overflow-hidden">

      {/* Drifting ambient orb */}
      <div ref={orbRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Static depth orbs */}
      <div className="absolute -top-48 -right-48 w-[640px] h-[640px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,211,187,0.06) 0%, transparent 65%)", filter: "blur(90px)" }} />
      <div className="absolute -bottom-48 -left-48 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 65%)", filter: "blur(90px)" }} />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg,transparent,rgba(0,211,187,0.35),transparent)" }} />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Heading */}
        <div ref={headRef} className="text-center mb-6">
          <p className="section-tag text-xs font-mono tracking-[0.3em] uppercase text-ivory/30 mb-5" style={{ opacity: 0 }}>
            The Full Stack
          </p>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold tracking-[-0.025em] text-ivory leading-tight mb-4">
            <SplitWords text="Everything your team" />{" "}
            <span style={{ overflow: "hidden", display: "inline-block" }}>
              <span data-word className="font-serif italic text-accent inline-block" style={{ opacity: 0 }}>needs</span>
            </span>
          </h2>
          <p ref={subtitleRef} className="text-ivory/40 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto" style={{ opacity: 0 }}>
            AI-powered chat, a developer community feed, and real-time collaboration — together in one obsidian workspace.
          </p>
        </div>

        {/* Draw-on separator */}
        <div ref={lineRef} className="w-full h-px mb-16 origin-left"
          style={{ background: "linear-gradient(90deg, rgba(0,211,187,0.5), rgba(167,139,250,0.3), transparent)" }} />

        {/* 3 Big Cards */}
        {/* Row 1: AI (full width) */}
        <div className="mb-5">
          <AICard cardRef={card0} />
        </div>

        {/* Row 2: Feed + Chat side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FeedCard cardRef={card1} />
          <ChatCard cardRef={card2} />
        </div>
      </div>
    </section>
  );
}
