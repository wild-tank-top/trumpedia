import { isAdmin } from "@/lib/roles";
import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { auth } from "@/auth";

const BASE_URLS = {
  v1: "https://generativelanguage.googleapis.com/v1",
  v1beta: "https://generativelanguage.googleapis.com/v1beta",
};

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "admin only" }, { status: 403 });
  }

  const apiKey = process.env.GOOGLE_GENERATION_AI_API_KEY;
  const results: Record<string, unknown> = {
    keySet: !!apiKey,
    keyPrefix: apiKey ? apiKey.slice(0, 8) + "..." : null,
  };

  for (const [version, baseURL] of Object.entries(BASE_URLS)) {
    for (const modelId of MODELS) {
      const key = `${version}/${modelId}`;
      try {
        const google = createGoogleGenerativeAI({ apiKey: apiKey!, baseURL });
        const { text } = await generateText({
          model: google(modelId),
          prompt: "Reply with the single word: OK",
          maxOutputTokens: 8,
        });
        results[key] = { ok: true, text: text.trim() };
      } catch (err: unknown) {
        const e = err as { message?: string; status?: number };
        results[key] = { ok: false, status: e?.status, message: e?.message };
      }
    }
  }

  return NextResponse.json(results);
}
