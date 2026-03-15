import { NextResponse } from "next/server";
import openai, { DEFAULT_MODEL } from "@/lib/openai";

function extractSuggestions(text) {
  if (!text) return [];

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

  const quoted = [...text.matchAll(/"([^"]{3,80})"/g)].map((m) => m[1]);
  if (quoted.length >= 2) return quoted.slice(0, 3);

  const listed = [...text.matchAll(/^[\s]*[1-3\-*•]\.*\s+(.{5,80})$/gm)].map((m) =>
    m[1].replace(/^["']|["']$/g, "").trim(),
  );
  if (listed.length >= 2) return listed.slice(0, 3);

  return [];
}

export async function POST(req) {
  if (!process.env.OPENROUTER_API_KEY) {
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
      .slice(-4)
      .map((m) => ({
        role: m.isMe ? "assistant" : "user",
        content: m.text,
      }));

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...contextMessages,
        {
          role: "user",
          content: `Suggest 3 short replies to: "${latestMessage}"`,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const choice = completion.choices?.[0]?.message;
    const content = choice?.content?.trim() || "";
    const reasoning = choice?.reasoning?.trim() || "";

    let suggestions = extractSuggestions(content);
    if (suggestions.length < 2) {
      suggestions = extractSuggestions(reasoning);
    }

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("[ai-reply] error:", err);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 },
    );
  }
}
