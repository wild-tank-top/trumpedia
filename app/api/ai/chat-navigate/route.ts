import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { GEMINI_MODEL, THINKING_OPTIONS, createGeminiClient } from "@/lib/gemini";

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
    "【例】",
    "悩み「高音がうまく出ません」→ キーワード: [\"高音\",\"ハイノート\",\"音域\"]",
    "悩み「基礎練習が続かない」→ キーワード: [\"基礎練習\",\"ロングトーン\",\"毎日\"]",
    "",
    '以下のJSONのみを返してください（説明文不要）: {"keywords":["kw1","kw2","kw3"]}',
  ].join("\n");
}

/** テキストから最初の JSON オブジェクトを抽出する（前後の説明文を無視） */
function extractJSON(text: string): Record<string, unknown> | null {
  // コードブロック内の JSON も対象にする
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  const match = cleaned.match(/\{[\s\S]*?\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const now = Date.now();
  if (now - lastGlobalCall < GLOBAL_COOLDOWN_MS) {
    return NextResponse.json({ error: "少し待ってから再度お試しください。" }, { status: 429 });
  }

  const google = createGeminiClient();
  if (!google) {
    return NextResponse.json(
      { error: "AI機能が設定されていません。" },
      { status: 503 }
    );
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
    console.info("[chat-navigate] calling model:", GEMINI_MODEL);
    const { text } = await generateText({
      model: google(GEMINI_MODEL),
      prompt: buildPrompt(message),
      maxOutputTokens: 256,
      temperature: 0.5,
      providerOptions: THINKING_OPTIONS,
    });

    console.info("[chat-navigate] raw response:", JSON.stringify(text.slice(0, 300)));

    const parsed = extractJSON(text);
    if (!parsed) {
      console.error("[chat-navigate] JSON parse failed. raw text:", text.slice(0, 300));
      throw new Error("JSON not found in response");
    }

    const keywords = Array.isArray(parsed.keywords)
      ? (parsed.keywords as unknown[]).map(String).filter(Boolean).slice(0, 4)
      : [];

    if (keywords.length === 0) {
      console.error("[chat-navigate] No keywords in parsed:", parsed);
      throw new Error("No keywords extracted");
    }

    console.info("[chat-navigate] keywords:", keywords);
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
      {
        error: "AI処理に失敗しました。もう一度お試しください。",
        detail: e?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
