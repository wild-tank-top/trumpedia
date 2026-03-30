/**
 * Gemini AI ユーティリティ
 *
 * Vercel AI SDK を介さず Gemini REST API を直接 fetch で呼び出す。
 * responseMimeType: "application/json" を指定することでモデルに
 * 有効な JSON のみを返させる（書式違反を防ぐ）。
 *
 * モデル: gemini-2.5-flash
 * APIバージョン: v1beta
 */

export const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  error?: { code: number; message: string; status: string };
};

/**
 * Gemini API を直接呼び出してテキストを生成する。
 * responseMimeType: "application/json" で JSON 強制出力。
 */
export async function callGemini({
  prompt,
  maxOutputTokens = 512,
  temperature = 0.5,
}: {
  prompt: string;
  maxOutputTokens?: number;
  temperature?: number;
}): Promise<string> {
  const apiKey = process.env.GOOGLE_GENERATION_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATION_AI_API_KEY is not set");
  }

  const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  console.info(
    "[gemini] callGemini | key:", apiKey.slice(0, 8) + "...",
    "| model:", GEMINI_MODEL,
    "| maxOutputTokens:", maxOutputTokens
  );

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens,
        temperature,
      },
    }),
  });

  const data = (await res.json()) as GeminiResponse;

  if (!res.ok || data.error) {
    const msg = data.error?.message ?? `HTTP ${res.status}`;
    const code = data.error?.code ?? res.status;
    console.error("[gemini] API error | code:", code, "| message:", msg);
    const err = new Error(msg) as Error & { status: number };
    err.status = code;
    throw err;
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  console.info("[gemini] response (200 chars):", JSON.stringify(text.slice(0, 200)));
  return text;
}
