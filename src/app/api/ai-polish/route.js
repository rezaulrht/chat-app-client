import { NextResponse } from "next/server";
import openai, { DEFAULT_MODEL } from "@/lib/openai";

function extractPolished(text) {
  if (!text) return null;

  try {
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.title || parsed.content) {
        return {
          title: typeof parsed.title === "string" ? parsed.title.trim() : "",
          content: typeof parsed.content === "string" ? parsed.content.trim() : "",
        };
      }
    }
  } catch {}

  return null;
}

export async function POST(req) {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "OpenRouter API key not configured" },
      { status: 500 },
    );
  }

  try {
    const { title, content, type } = await req.json();

    if (!content?.trim() || content.trim().length < 20) {
      return NextResponse.json(
        { error: "Content must be at least 20 characters" },
        { status: 400 },
      );
    }

    const truncatedContent = content.slice(0, 3000);

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a post editor for a developer community.\nRewrite the title and body to be clear, concise, and well-structured.\nFix grammar. Keep technical terms exact.\nOutput ONLY valid JSON: { \"title\": \"...\", \"content\": \"...\" }",
        },
        {
          role: "user",
          content: `Post type: ${type || "post"}\nTitle: ${title || ""}\nContent: ${truncatedContent}`,
        },
      ],
      max_tokens: 600,
      temperature: 0.3,
    });

    const choice = completion.choices?.[0]?.message;
    const rawContent = choice?.content?.trim() || "";
    const reasoning = choice?.reasoning?.trim() || "";

    let polished = extractPolished(rawContent);
    if (!polished) {
      polished = extractPolished(reasoning);
    }

    if (!polished) {
      return NextResponse.json(
        { error: "Could not parse polished output" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      title: polished.title,
      content: polished.content,
    });
  } catch (err) {
    console.error("[ai-polish] error:", err);
    return NextResponse.json(
      { error: "Failed to polish post" },
      { status: 500 },
    );
  }
}
