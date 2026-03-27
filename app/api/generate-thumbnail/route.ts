import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/auth";

const RATE_LIMIT_MS = 5_000; // 同一ユーザーの連打防止（5秒）
const lastGenerated = new Map<string, number>();

function buildPrompt(title: string, category: string): string {
  return [
    "Create a clean, modern thumbnail image for a trumpet Q&A article.",
    `Topic: "${title}"`,
    `Category: ${category}`,
    "Style: flat design, warm amber and teal color palette, no text, no letters, no words.",
    "Show a symbolic visual — e.g. a trumpet, sheet music, or abstract music-themed shapes.",
    "Square composition, high contrast, professional illustration style.",
  ].join(" ");
}

export async function POST(req: NextRequest) {
  // ── 認証 ─────────────────────────────────────────────
  const session = await auth();
  if (!session?.user.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  // ── レート制限（連打防止） ────────────────────────────
  const userId = session.user.id;
  const now = Date.now();
  const last = lastGenerated.get(userId) ?? 0;
  if (now - last < RATE_LIMIT_MS) {
    const wait = Math.ceil((RATE_LIMIT_MS - (now - last)) / 1000);
    return NextResponse.json(
      { error: `少し待ってから再生成してください（あと${wait}秒）` },
      { status: 429 }
    );
  }
  lastGenerated.set(userId, now);

  // ── リクエスト解析 ────────────────────────────────────
  let title: string;
  let category: string;
  try {
    const body = await req.json();
    title = String(body.title ?? "").trim();
    category = String(body.category ?? "").trim();
    if (!title) throw new Error("title is required");
  } catch {
    return NextResponse.json(
      { error: "title が必要です" },
      { status: 400 }
    );
  }

  // ── OpenAI 環境変数チェック ───────────────────────────
  if (!process.env.OPENAI_API_KEY) {
    console.error("[generate-thumbnail] OPENAI_API_KEY is not set");
    return NextResponse.json(
      { error: "サーバーの設定が不完全です" },
      { status: 500 }
    );
  }

  // ── 画像生成 ──────────────────────────────────────────
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = buildPrompt(title, category);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error("No image URL in response");
    }

    return NextResponse.json({ url: imageUrl });
  } catch (err: unknown) {
    console.error("[generate-thumbnail] OpenAI error:", err);

    // OpenAI SDK のエラーオブジェクトから詳細を取得
    if (err && typeof err === "object" && "status" in err) {
      const status = (err as { status: number }).status;
      if (status === 400) {
        return NextResponse.json(
          { error: "プロンプトの内容がポリシーに違反しています" },
          { status: 400 }
        );
      }
      if (status === 429) {
        return NextResponse.json(
          { error: "OpenAI のレート制限に達しました。しばらくお待ちください" },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "画像の生成に失敗しました。もう一度お試しください" },
      { status: 500 }
    );
  }
}
