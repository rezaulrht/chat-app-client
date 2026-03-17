import { NextResponse } from "next/server";
import openai, { DEFAULT_MODEL } from "@/lib/openai";

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
  if (!process.env.OPENROUTER_API_KEY) {
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

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
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
      max_tokens: 500,
      temperature: 0.4,
    });

    const choice = completion.choices?.[0]?.message;
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
