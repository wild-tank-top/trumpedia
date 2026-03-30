import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export const dynamic = "force-dynamic";

let lastGlobalCall = 0;
const GLOBAL_COOLDOWN_MS = 3_000;

function buildPrompt(message: string): string {
  return [
    "あなたはトランペットQ&Aプラットフォームの検索アシスタントです。",
    "ユーザーの悩みから、既存の質問を検索するための日本語キーワードを3つ抽出してください。",
    "キーワードは1〜6文字程度の短い単語・フレーズにしてください。",
    "",
    "ユーザーの悩み:「" + message + "」",
    "",
    "例:",
    "悩み「高音がうまく出ません」→ {\"keywords\":[\"高音\",\"ハイノート\",\"音域\"]}",
    "悩み「基礎練習が続かない」→ {\"keywords\":[\"基礎練習\",\"ロングトーン\",\"毎日\"]}",
    "",
    "上記の形式でJSONを返してください。",
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const now = Date.now();
  if (now - lastGlobalCall < GLOBAL_COOLDOWN_MS) {
    return NextResponse.json({ error: "少し待ってから再度お試しください。" }, { status: 429 });
  }

  let message: string;
  try {
    const body = await req.json() as Record<string, unknown>;
    message = String(body.message ?? "").trim();
    if (!message) throw new Error("empty");
  } catch {
    return NextResponse.json({ error: "悩みを入力してください" }, { status: 400 });
  }

  if (message.length > 300) {
    return NextResponse.json({ error: "入力は300文字以内にしてください" }, { status: 400 });
  }

  lastGlobalCall = now;

  try {
    console.info("[chat-navigate] start | message:", message.slice(0, 50));

    const text = await callGemini({
      prompt: buildPrompt(message),
      maxOutputTokens: 2048,
      temperature: 0.3,
    });

    const parsed = JSON.parse(text) as { keywords?: unknown };
    const keywords = Array.isArray(parsed.keywords)
      ? (parsed.keywords as unknown[]).map(String).filter(Boolean).slice(0, 4)
      : [];

    if (keywords.length === 0) throw new Error("No keywords in response: " + text.slice(0, 100));

    console.info("[chat-navigate] success | keywords:", keywords);
    return NextResponse.json({ keywords });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    console.error("[chat-navigate] FAILED | status:", e?.status, "| message:", e?.message);
    if (e?.status === 429) {
      return NextResponse.json(
        { error: "AIの利用上限に達しました。しばらくしてからお試しください。" },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "AI処理に失敗しました。もう一度お試しください。", detail: e?.message ?? String(err) },
      { status: 500 }
    );
  }
}
