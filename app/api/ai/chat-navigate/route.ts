import { NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const MODEL = "gemini-1.5-flash";

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
    "【例】",
    "悩み「高音がうまく出ません」→ キーワード: [\"高音\",\"ハイノート\",\"音域\"]",
    "悩み「基礎練習が続かない」→ キーワード: [\"基礎練習\",\"ロングトーン\",\"毎日\"]",
    "",
    '以下のJSONのみを返してください（説明文不要）: {"keywords":["kw1","kw2","kw3"]}',
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_GENERATION_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI機能が設定されていません" }, { status: 503 });
  }

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
    const google = createGoogleGenerativeAI({ apiKey });
    const { text } = await generateText({
      model: google(MODEL),
      prompt: buildPrompt(message),
      maxOutputTokens: 128,
      temperature: 0.5,
    });

    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) throw new Error("JSON not found");
    const parsed = JSON.parse(jsonMatch[0]) as { keywords?: unknown };

    const keywords = Array.isArray(parsed.keywords)
      ? (parsed.keywords as unknown[]).map(String).filter(Boolean).slice(0, 4)
      : [];

    if (keywords.length === 0) throw new Error("No keywords extracted");

    return NextResponse.json({ keywords });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    console.error("[chat-navigate]", e?.status, e?.message, err);
    if (e?.status === 429) {
      return NextResponse.json(
        { error: "AIの利用上限に達しました。しばらくしてからお試しください。" },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "AI処理に失敗しました。もう一度お試しください。", detail: e?.message },
      { status: 500 }
    );
  }
}
