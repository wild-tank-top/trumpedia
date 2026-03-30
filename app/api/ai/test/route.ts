import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "admin only" }, { status: 403 });
  }

  const apiKey = process.env.GOOGLE_GENERATION_AI_API_KEY;
  const results: Record<string, unknown> = {
    keySet: !!apiKey,
    keyPrefix: apiKey ? apiKey.slice(0, 8) + "..." : null,
  };

  const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
  for (const modelId of models) {
    try {
      const google = createGoogleGenerativeAI({ apiKey: apiKey! });
      const { text } = await generateText({
        model: google(modelId),
        prompt: "Say 'OK' in one word.",
        maxOutputTokens: 10,
      });
      results[modelId] = { ok: true, text };
    } catch (err: unknown) {
      const e = err as { message?: string; status?: number; statusText?: string };
      results[modelId] = {
        ok: false,
        status: e?.status,
        message: e?.message,
      };
    }
  }

  return NextResponse.json(results);
}
