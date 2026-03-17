import OpenAI from "openai";

/**
 * Shared OpenAI client configured for OpenRouter.
 * Reused across all AI API routes.
 */
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "ConvoX",
  },
});

export const DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

export default openai;
