import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { auth } from "@/auth";
import { GEMINI_MODEL, THINKING_OPTIONS, createGeminiClient } from "@/lib/gemini";

export const dynamic = "force-dynamic";

const lastUsed = new Map<string, number>();
const COOLDOWN_MS = 10_000;

const LEVEL_LABELS: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

function buildPrompt(
  title: string,
  content: string,
  category: string,
  level: string
): string {
  const levelLabel = LEVEL_LABELS[level] ?? level ?? "未選択";
  return [
    "あなたはトランペット専門Q&Aプラットフォーム「トランペディア」の文章編集アシスタントです。",
    "以下の質問の下書きを、プロのトランペット奏者に向けた明確で丁寧な質問文にリライトしてください。",
    "",
    "カテゴリ: " + (category || "未選択"),
    "難易度: " + levelLabel,
    "タイトル（下書き）: " + (title || "（未入力）"),
    "質問内容（下書き）: " + (content || "（未入力）"),
    "",
    "【ルール】",
    "・タイトルは疑問形で30文字以内",
    "・内容は丁寧な文体で200文字以内",
    "・下書きの情報を活かして膨らませてください",
    "・下書きが空の場合もカテゴリ・難易度から質問を生成してください",
    "",
    '以下のJSONのみを返してください（説明文不要）: {"title":"タイトル","content":"内容"}',
  ].join("\n");
}

/** テキストから最初の JSON オブジェクトを抽出する（前後の説明文を無視） */
function extractJSON(text: string): Record<string, unknown> | null {
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
  const session = await auth();
  if (!session?.user.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = Date.now();
  if (now - (lastUsed.get(userId) ?? 0) < COOLDOWN_MS) {
    const wait = Math.ceil((COOLDOWN_MS - (now - (lastUsed.get(userId) ?? 0))) / 1000);
    return NextResponse.json(
      { error: "少し待ってから再度お試しください（あと" + wait + "秒）" },
      { status: 429 }
    );
  }

  const google = createGeminiClient();
  if (!google) {
    return NextResponse.json(
      { error: "AI機能が設定されていません。" },
      { status: 503 }
    );
  }

  let title: string, content: string, category: string, level: string;
  try {
    const body = await req.json() as Record<string, unknown>;
    title    = String(body.title    ?? "").trim();
    content  = String(body.content  ?? "").trim();
    category = String(body.category ?? "").trim();
    level    = String(body.level    ?? "").trim();
    if (!title && !content) throw new Error("empty");
  } catch {
    return NextResponse.json({ error: "入力内容が正しくありません" }, { status: 400 });
  }

  lastUsed.set(userId, now);

  try {
    console.info("[polish-question] calling model:", GEMINI_MODEL);
    const { text } = await generateText({
      model: google(GEMINI_MODEL),
      prompt: buildPrompt(title, content, category, level),
      maxOutputTokens: 512,
      temperature: 0.7,
      providerOptions: THINKING_OPTIONS,
    });

    console.info("[polish-question] raw response:", JSON.stringify(text.slice(0, 300)));

    const parsed = extractJSON(text);
    if (!parsed) {
      console.error("[polish-question] JSON parse failed. raw text:", text.slice(0, 300));
      throw new Error("JSON not found in response");
    }

    const newTitle   = String(parsed.title   ?? "").trim();
    const newContent = String(parsed.content ?? "").trim();
    if (!newTitle || !newContent) throw new Error("Empty response fields");

    return NextResponse.json({ title: newTitle, content: newContent });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    console.error("[polish-question] FAILED | status:", e?.status, "| message:", e?.message);
    if (e?.status === 429) {
      return NextResponse.json(
        { error: "AIの利用上限に達しました。しばらくしてからお試しください。" },
        { status: 429 }
      );
    }
    return NextResponse.json(
      {
        error: "AI処理中にエラーが発生しました。もう一度お試しください。",
        detail: e?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
