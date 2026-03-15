import { NextResponse } from "next/server";
import openai, { DEFAULT_MODEL } from "@/lib/openai";

export async function POST(req) {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "OpenRouter API key not configured" },
      { status: 500 },
    );
  }

  try {
    const { text, tone } = await req.json();

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

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
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
      max_tokens: 400,
      temperature: 0.4,
    });

    const choice = completion.choices?.[0]?.message;
    const content = choice?.content?.trim() || "";
    const reasoning = choice?.reasoning?.trim() || "";

    let raw = content || reasoning;
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
