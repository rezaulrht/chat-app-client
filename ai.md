# AI Reply Suggestion — Implementation Guide

## Overview

Adds a **✦ AI** button to the chat input toolbar. When clicked, it reads the last 10 messages and calls OpenRouter to generate 3 short reply suggestions. The suggestions appear as clickable chips above the input bar. Clicking a chip fills the input field so the user can edit and send.

**No Express backend changes needed.** Everything lives inside the Next.js client app.

---

## Architecture

```
Browser (ChatWindow.jsx)
  └─ clicks ✦ AI button
       └─ fetch POST /api/ai-reply   ← Next.js server-side route (src/app/api/ai-reply/route.js)
            └─ fetch OpenRouter API  ← external, uses OPENROUTER_API_KEY (secret, server-only)
                 └─ returns 3 suggestions → chips appear above input
```

---

## Step 1 — Add the API Key

In `chat-app-client/.env.local`, add:

```env
# OpenRouter AI — server-side only, do NOT prefix with NEXT_PUBLIC
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
```

Get a free key at https://openrouter.ai. The model used is completely free with no billing required.

> **Important:** No `NEXT_PUBLIC_` prefix. This keeps the key server-side only and never exposed to the browser.

---

## Step 2 — Create the Next.js API Route

Create file: `src/app/api/ai-reply/route.js`

```js
import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

function extractSuggestions(text) {
  if (!text) return [];

  // Try JSON array first
  try {
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        const result = parsed.filter((s) => typeof s === "string" && s.length > 1);
        if (result.length > 0) return result.slice(0, 3);
      }
    }
  } catch {}

  // Fallback: extract quoted strings
  const quoted = [...text.matchAll(/"([^"]{3,80})"/g)].map((m) => m[1]);
  if (quoted.length >= 2) return quoted.slice(0, 3);

  // Fallback: numbered/bulleted list like "1. Sure thing!" or "- Sure thing!"
  const listed = [...text.matchAll(/^[\s]*[1-3\-*•]\.*\s+(.{5,80})$/gm)].map((m) =>
    m[1].replace(/^["']|["']$/g, "").trim(),
  );
  if (listed.length >= 2) return listed.slice(0, 3);

  return [];
}

export async function POST(req) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "OpenRouter API key not configured" },
      { status: 500 },
    );
  }

  try {
    const { messages, latestMessage } = await req.json();

    if (!latestMessage?.trim()) {
      return NextResponse.json({ suggestions: [] });
    }

    const systemPrompt = `You are a chat reply assistant. Suggest exactly 3 short, natural reply options (each under 12 words) for the latest message. Output ONLY a JSON array of 3 strings. No explanation, no markdown. Example output: ["Sounds good!", "I'll check and get back to you", "Thanks for the update!"]`;

    const contextMessages = (messages || [])
      .filter((m) => m.text)
      .map((m) => ({
        role: m.isMe ? "assistant" : "user",
        content: m.text,
      }));

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "ConvoX Chat",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            ...contextMessages,
            {
              role: "user",
              content: `Suggest 3 short replies to: "${latestMessage}"`,
            },
          ],
          max_tokens: 8192,  // MUST be high — this is a reasoning model, it thinks first
          temperature: 0.7,
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("[AI route] OpenRouter error:", errText);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;

    // nvidia/nemotron is a reasoning model — content can be null,
    // actual output may live in the `reasoning` field
    const content = choice?.content?.trim() || "";
    const reasoning = choice?.reasoning?.trim() || "";

    // Try content first, fallback to reasoning
    let suggestions = extractSuggestions(content);
    if (suggestions.length < 2) {
      suggestions = extractSuggestions(reasoning);
    }

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("[AI route] error:", err);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 },
    );
  }
}
```

### Why `max_tokens: 8192`?

`nvidia/nemotron-3-super-120b-a12b:free` is a **reasoning model**. It writes a chain-of-thought into a `reasoning` field before producing `content`. With a low token limit (e.g. 150), it exhausts all tokens mid-thought and `content` comes back `null`. Setting it high (8192) gives it room to finish thinking and output the JSON array.

### Why `extractSuggestions()` checks both `content` and `reasoning`?

Even with a high limit, sometimes `content` is null and the final answer is embedded inside `reasoning`. The helper tries three parsing strategies (JSON array → quoted strings → numbered list) on both fields.

---

## Step 3 — Modify `ChatWindow.jsx`

### 3a. Add state and ref

After the existing `suggestions` / `suggestionIndex` state declarations:

```jsx
const [aiReplies, setAiReplies] = useState([]);
const [loadingAiReplies, setLoadingAiReplies] = useState(false);
const lastAiRepliesForMsgRef = useRef(null); // not actively used with manual button, kept for future
```

### 3b. Add `fetchAiReplies` callback

Place this after the `scrollIntoView` useEffect and before `refreshScheduled`:

```jsx
const fetchAiReplies = useCallback(
  async (messagesList) => {
    const visible = messagesList
      .filter((m) => !m.isOptimistic && !m.isDeleted && m.text?.trim())
      .slice(-10);

    if (visible.length === 0) return;

    const lastMsg = visible[visible.length - 1];

    setLoadingAiReplies(true);
    setAiReplies([]);

    try {
      const context = visible.slice(0, -1).map((m) => ({
        text: m.text,
        isMe: (m.sender?._id ?? m.sender) === user?._id,
      }));

      const res = await fetch("/api/ai-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: context,
          latestMessage: lastMsg.text,
        }),
      });

      const data = await res.json();
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setAiReplies(data.suggestions.slice(0, 3));
      }
    } catch (err) {
      console.error("[AI] fetchAiReplies error:", err);
    } finally {
      setLoadingAiReplies(false);
    }
  },
  [user?._id],
);
```

### 3c. Add `handleAiButton` callback

Place this after `refreshScheduled`'s useEffect:

```jsx
const handleAiButton = useCallback(() => {
  const visible = messages.filter(
    (m) => !m.isOptimistic && !m.isDeleted && m.text?.trim(),
  );
  fetchAiReplies(visible);
}, [messages, fetchAiReplies]);
```

### 3d. Clear AI replies when conversation changes

Inside the `fetchMessages` async function (inside the conversation `useEffect`), add these two lines alongside the other state resets:

```jsx
setAiReplies([]);
lastAiRepliesForMsgRef.current = null;
```

### 3e. Clear AI replies when user sends a message

In `handleSend`, right after `setText("")`:

```jsx
setAiReplies([]);
```

### 3f. Add the suggestion chips UI

Inside the `<form>`, right before the `<div className="bg-slate-surface rounded-2xl ...">` input bar:

```jsx
{(aiReplies.length > 0 || loadingAiReplies) && (
  <div className="flex items-center gap-1.5 flex-wrap mb-2 px-1">
    <span className="text-[9px] text-ivory/20 font-semibold uppercase tracking-wide">
      AI
    </span>
    {loadingAiReplies ? (
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <span className="text-[10px] text-ivory/30">Generating replies...</span>
      </div>
    ) : (
      <>
        {aiReplies.map((reply, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setText(reply)}
            className="px-3 py-1 text-[11px] rounded-full bg-accent/10 border border-accent/20 text-accent/80 hover:bg-accent/20 hover:text-accent transition-all max-w-[180px] truncate"
            title={reply}
          >
            {reply}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setAiReplies([])}
          className="ml-auto p-0.5 text-ivory/20 hover:text-ivory/50 transition-colors"
          title="Dismiss suggestions"
          aria-label="Dismiss AI suggestions"
        >
          <X size={11} />
        </button>
      </>
    )}
  </div>
)}
```

### 3g. Add the ✦ AI button — desktop toolbar

Inside the `<div className="bg-slate-surface rounded-2xl ...">`, after the GIF button:

```jsx
<button
  type="button"
  onClick={handleAiButton}
  disabled={loadingAiReplies}
  title="AI reply suggestions"
  aria-label="AI reply suggestions"
  className={`hidden sm:inline-flex items-center gap-1 px-2 py-1 mx-1 text-[10px] font-black rounded-md border transition-all ${
    loadingAiReplies
      ? "bg-accent/20 border-accent/40 text-accent cursor-not-allowed"
      : aiReplies.length > 0
        ? "bg-accent/20 border-accent/40 text-accent"
        : "bg-white/4 border-white/10 text-ivory/30 hover:bg-accent/10 hover:border-accent/30 hover:text-accent"
  }`}
>
  {loadingAiReplies ? (
    <span className="w-2.5 h-2.5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
  ) : (
    "✦ AI"
  )}
</button>
```

### 3h. Add the ✦ AI button — mobile toolbar row

Inside the `sm:hidden` mobile toolbar `<div>`, after the GIF button:

```jsx
<button
  type="button"
  onClick={handleAiButton}
  disabled={loadingAiReplies}
  title="AI reply suggestions"
  aria-label="AI reply suggestions"
  className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black rounded-md border transition-all ${
    loadingAiReplies
      ? "bg-accent/20 border-accent/40 text-accent cursor-not-allowed"
      : aiReplies.length > 0
        ? "bg-accent/20 border-accent/40 text-accent"
        : "bg-white/4 border-white/10 text-ivory/30 hover:bg-accent/10 hover:border-accent/30 hover:text-accent"
  }`}
>
  {loadingAiReplies ? (
    <span className="w-2.5 h-2.5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
  ) : (
    "✦ AI"
  )}
</button>
```

---

## UX Behaviour Summary

| State | Button | Chips area |
|---|---|---|
| Idle | dim, clickable | hidden |
| Loading | spins, disabled | shows spinner + "Generating replies..." |
| Done | highlighted (accent) | 3 teal chip buttons + ✕ dismiss |
| User clicks chip | — | fills input field, chips stay |
| User sends message | resets to idle | cleared |
| User switches conversation | resets to idle | cleared |

---

## Issues Encountered & Fixes

### Issue 1 — `suggestions: []` returned despite 200 OK

**Cause:** `content` was `null` in the model response. The model is a reasoning model (`nvidia/nemotron`). It writes its chain-of-thought into a separate `reasoning` field. With `max_tokens: 150`, it ran out of tokens mid-reasoning and never produced `content`.

**Fix:**
- Raised `max_tokens` to `8192`
- Added fallback: if `content` is null or empty, extract suggestions from the `reasoning` field instead

### Issue 2 — JSON parsing fails when model wraps output in markdown fences

**Cause:** Some models return ` ```json [...] ``` ` instead of a raw array.

**Fix:** `extractSuggestions()` uses regex to find a JSON array anywhere in the text, then falls back to quoted strings, then to numbered lists.
