import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

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
  if (!OPENROUTER_API_KEY) {
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

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "ConvoX Feed",
        },
        body: JSON.stringify({
          model: MODEL,
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
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("[ai-polish] OpenRouter error:", response.status, errText);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;
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
