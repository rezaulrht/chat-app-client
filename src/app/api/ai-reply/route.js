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
          max_tokens: 8192,
          temperature: 0.7,
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("[AI route] OpenRouter HTTP", response.status, response.statusText);
      console.error("[AI route] model:", MODEL);
      console.error("[AI route] response body:", errText);
      console.error("[AI route] request headers sent:", {
        Authorization: `Bearer ${OPENROUTER_API_KEY?.slice(0, 12)}...`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      });
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await response.json();
    console.log("[AI route] OpenRouter response OK");
    console.log("[AI route] raw data:", JSON.stringify(data, null, 2));
    const choice = data.choices?.[0]?.message;

    const content = choice?.content?.trim() || "";
    const reasoning = choice?.reasoning?.trim() || "";

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
