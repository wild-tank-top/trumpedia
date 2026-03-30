/**
 * Gemini AI クライアント共有モジュール
 *
 * モデル: gemini-2.5-flash
 * APIバージョン: v1 (安定版)
 * 思考モード: 無効 (thinkingBudget=0) — タイムアウト防止
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1";

/**
 * 思考モードを無効化するプロバイダーオプション。
 * gemini-2.5-flash はデフォルトで thinking が ON になっており、
 * Vercel の関数タイムアウト (10s) を超える場合があるため明示的に OFF にする。
 */
export const THINKING_DISABLED = {
  google: { thinkingConfig: { thinkingBudget: 0 } },
} as const;

// ── ヘルスチェック状態（モジュールスコープでキャッシュ） ──────────────
// サーバーレスでは同一インスタンス内で再利用される。
let healthStatus: "unknown" | "ok" | "unavailable" = "unknown";
let healthCheckedAt = 0;
const HEALTH_CACHE_MS = 5 * 60 * 1000;

/**
 * AI が利用可能かどうかを返す。
 * 初回または 5 分経過後に疎通確認を実施する。
 */
export async function checkAIAvailability(): Promise<boolean> {
  const now = Date.now();
  if (healthStatus !== "unknown" && now - healthCheckedAt < HEALTH_CACHE_MS) {
    console.info("[gemini] health cache hit:", healthStatus);
    return healthStatus === "ok";
  }

  const apiKey = process.env.GOOGLE_GENERATION_AI_API_KEY;
  console.info(
    "[gemini] checking API key:",
    apiKey ? apiKey.slice(0, 8) + "..." : "NOT SET",
    "| model:", GEMINI_MODEL,
    "| baseURL:", GEMINI_BASE_URL
  );

  if (!apiKey) {
    console.error("[gemini] GOOGLE_GENERATION_AI_API_KEY is NOT set");
    healthStatus = "unavailable";
    healthCheckedAt = now;
    return false;
  }

  try {
    const google = createGoogleGenerativeAI({ apiKey, baseURL: GEMINI_BASE_URL });
    const { text } = await generateText({
      model: google(GEMINI_MODEL),
      prompt: "Reply with the single word: OK",
      maxOutputTokens: 8,
      providerOptions: THINKING_DISABLED,
    });
    console.info("[gemini] health check OK. response:", JSON.stringify(text.trim()));
    healthStatus = "ok";
    healthCheckedAt = now;
    return true;
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    console.error("[gemini] health check FAILED | status:", e?.status, "| message:", e?.message);
    healthStatus = "unavailable";
    healthCheckedAt = now;
    return false;
  }
}

/** Google Generative AI クライアントを生成する。APIキー未設定時は null を返す。 */
export function createGeminiClient() {
  const apiKey = process.env.GOOGLE_GENERATION_AI_API_KEY;
  if (!apiKey) return null;
  return createGoogleGenerativeAI({ apiKey, baseURL: GEMINI_BASE_URL });
}
