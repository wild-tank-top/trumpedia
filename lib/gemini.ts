/**
 * Gemini AI クライアント共有モジュール
 *
 * モデル: gemini-2.5-flash
 * APIバージョン: v1 (安定版)
 * 思考モード: thinkingBudget=1024
 *   - 0 にすると JSON 書式指示を無視した自由テキストが返るため最小限の思考を許容
 *   - 1024 トークン程度なら Vercel の 10s タイムアウト内に収まる
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1";

/**
 * 思考モードを最小限に抑えるプロバイダーオプション。
 * 0 にすると書式指示を守らないため 1024 を指定する。
 */
export const THINKING_OPTIONS = {
  google: { thinkingConfig: { thinkingBudget: 1024 } },
} as const;

/** Google Generative AI クライアントを生成する。APIキー未設定時は null を返す。 */
export function createGeminiClient() {
  const apiKey = process.env.GOOGLE_GENERATION_AI_API_KEY;
  if (!apiKey) {
    console.error("[gemini] GOOGLE_GENERATION_AI_API_KEY is NOT set");
    return null;
  }
  console.info("[gemini] client created | key:", apiKey.slice(0, 8) + "...", "| model:", GEMINI_MODEL);
  return createGoogleGenerativeAI({ apiKey, baseURL: GEMINI_BASE_URL });
}
