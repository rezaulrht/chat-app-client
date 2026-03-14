import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

function extractTags(text) {
  if (!text) return [];

  try {
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((t) => typeof t === "string" && t.length > 0 && t.length <= 20)
          .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
          .slice(0, 5);
      }
    }
  } catch {}

  const quoted = [...text.matchAll(/"([^"]{1,20})"/g)].map((m) =>
    m[1].trim().toLowerCase().replace(/\s+/g, "-"),
  );
  if (quoted.length > 0) return quoted.slice(0, 5);

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
    const { title, content, type, existingTags } = await req.json();

    if (!title?.trim() && !content?.trim()) {
      return NextResponse.json(
        { error: "Title or content is required" },
        { status: 400 },
      );
    }

    const safeExisting = Array.isArray(existingTags) ? existingTags : [];
    const truncatedContent = (content || "").slice(0, 3000);

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
                "You are a tag suggester for a developer community.\nSuggest up to 5 short lowercase hyphenated tags.\nInclude a MIX of:\n- 2-3 topic-specific tags about the technology or concept (e.g. 'react-hooks', 'mongoose', 'rest-api')\n- 1-2 broader category or community tags that describe the nature of the post (e.g. 'learning', 'til', 'backend', 'frontend', 'web-dev', 'career', 'devops', 'beginner', 'best-practices', 'tutorial')\nAvoid overly generic tags like 'programming' or 'code'.\nOutput ONLY a JSON array of strings. Each tag under 20 chars.",
            },
            {
              role: "user",
              content: `Post type: ${type || "post"}\nTitle: ${title || ""}\nContent: ${truncatedContent}\nAlready tagged: ${safeExisting.join(", ")}`,
            },
          ],
          max_tokens: 512,
          temperature: 0.4,
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("[ai-tags] OpenRouter error:", response.status, errText);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;
    const rawContent = choice?.content?.trim() || "";
    const reasoning = choice?.reasoning?.trim() || "";

    let tags = extractTags(rawContent);
    if (tags.length === 0) {
      tags = extractTags(reasoning);
    }

    const filtered = tags.filter(
      (t) => !safeExisting.includes(t) && t.length <= 20,
    );

    return NextResponse.json({ tags: filtered });
  } catch (err) {
    console.error("[ai-tags] error:", err);
    return NextResponse.json(
      { error: "Failed to suggest tags" },
      { status: 500 },
    );
  }
}
