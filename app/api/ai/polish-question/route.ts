import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { callGemini } from "@/lib/gemini";

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
    "ルール:",
    "・タイトルは疑問形で30文字以内",
    "・内容は丁寧な文体で200文字以内",
    "・下書きの情報を活かして膨らませること",
    "",
    "次のJSON形式で返してください:",
    "{\"title\":\"タイトル\",\"content\":\"内容\"}",
  ].join("\n");
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
    console.info("[polish-question] start | userId:", userId.slice(0, 8));

    const text = await callGemini({
      prompt: buildPrompt(title, content, category, level),
      maxOutputTokens: 512,
      temperature: 0.7,
    });

    const parsed = JSON.parse(text) as { title?: unknown; content?: unknown };
    const newTitle   = String(parsed.title   ?? "").trim();
    const newContent = String(parsed.content ?? "").trim();

    if (!newTitle || !newContent) {
      throw new Error("Empty fields in response: " + text.slice(0, 100));
    }

    console.info("[polish-question] success");
    return NextResponse.json({ title: newTitle, content: newContent });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    console.error("[polish-question] FAILED | status:", e?.status, "| message:", e?.message);
    if (e?.status === 429) {
      return NextResponse.json(
        { error: "AI機能は現在メンテナンス中です。しばらくしてからお試しください。" },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "AI処理中にエラーが発生しました。もう一度お試しください。", detail: e?.message ?? String(err) },
      { status: 500 }
    );
  }
}
