import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

export async function POST(req) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "OpenRouter API key not configured" },
      { status: 500 },
    );
  }

  try {
    const { text, tone } = await req.json();

    // Validate inputs
    if (!tone?.trim() || tone.trim().length > 30) {
      return NextResponse.json(
        { error: "tone must be 1–30 characters" },
        { status: 400 },
      );
    }
    if (!text?.trim()) {
      return NextResponse.json(
        { error: "text must not be empty" },
        { status: 400 },
      );
    }

    const truncatedText = text.slice(0, 2000);

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
            {
              role: "system",
              content:
                "You are a message rewriting assistant. Rewrite the user's message in the requested tone. Output ONLY the rewritten message text. No explanation, no introduction, no quotes, no labels. Just the rewritten text.",
            },
            {
              role: "user",
              content: `Rewrite this message in a ${tone} tone: "${truncatedText}"`,
            },
          ],
          max_tokens: 8192,
          temperature: 0.4,
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("[ai-rewrite] OpenRouter error:", response.status, errText);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;
    const content = choice?.content?.trim() || "";
    const reasoning = choice?.reasoning?.trim() || "";

    // Prefer content; fall back to reasoning (reasoning model may put answer there)
    let raw = content || reasoning;

    // Strip common leading label patterns the model might add
    raw = raw.replace(/^(here(?:'s| is)|rewritten(?: version)?|result)[^:]*:\s*/i, "");

    return NextResponse.json({ rewrite: raw.trim() });
  } catch (err) {
    console.error("[ai-rewrite] error:", err);
    return NextResponse.json(
      { error: "Failed to rewrite message" },
      { status: 500 },
    );
  }
}
