/**
 * Gemini AI クライアント共有モジュール
 *
 * モデル: gemini-2.5-flash
 * APIバージョン: v1 (安定版)
 * ヘルスチェック: モジュールロード時に1回だけ疎通確認を実施し、
 *   結果を MODULE_SCOPE にキャッシュする。
 *   quota limit:0 / 5xx の場合は AI 機能を自動無効化する。
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export const GEMINI_MODEL = "gemini-2.5-flash";

// v1beta ではなく安定版 v1 を使用
// (gemini-2.5-flash は v1 で公開済み)
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1";

// ── ヘルスチェック状態（モジュールスコープでキャッシュ） ─────────────
let healthStatus: "unknown" | "ok" | "unavailable" = "unknown";
let healthCheckedAt = 0;
const HEALTH_CACHE_MS = 5 * 60 * 1000; // 5分間キャッシュ

export function getHealthStatus() {
  return healthStatus;
}

/**
 * AI が利用可能かどうかを返す。
 * 初回または 5 分経過後に疎通確認を実施する。
 */
export async function checkAIAvailability(): Promise<boolean> {
  const now = Date.now();

  // キャッシュが有効な場合はそのまま返す
  if (healthStatus !== "unknown" && now - healthCheckedAt < HEALTH_CACHE_MS) {
    return healthStatus === "ok";
  }

  const apiKey = process.env.GOOGLE_GENERATION_AI_API_KEY;

  // ── 環境変数ロギング ───────────────────────────────────────────────
  if (!apiKey) {
    console.error("[gemini] GOOGLE_GENERATION_AI_API_KEY is NOT set");
    healthStatus = "unavailable";
    healthCheckedAt = now;
    return false;
  }
  console.info(
    "[gemini] API key detected:",
    apiKey.slice(0, 8) + "...",
    "| model:", GEMINI_MODEL,
    "| baseURL:", GEMINI_BASE_URL
  );

  // ── 疎通確認 ────────────────────────────────────────────────────────
  try {
    const google = createGoogleGenerativeAI({ apiKey, baseURL: GEMINI_BASE_URL });
    const { text } = await generateText({
      model: google(GEMINI_MODEL),
      prompt: "Reply with the single word: OK",
      maxOutputTokens: 8,
    });
    console.info("[gemini] health check OK:", text.trim());
    healthStatus = "ok";
    healthCheckedAt = now;
    return true;
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    console.error(
      "[gemini] health check FAILED | status:", e?.status,
      "| message:", e?.message
    );
    healthStatus = "unavailable";
    healthCheckedAt = now;
    return false;
  }
}

/**
 * Google Generative AI クライアントを生成する。
 * APIキーが未設定の場合は null を返す。
 */
export function createGeminiClient() {
  const apiKey = process.env.GOOGLE_GENERATION_AI_API_KEY;
  if (!apiKey) return null;
  return createGoogleGenerativeAI({ apiKey, baseURL: GEMINI_BASE_URL });
}
