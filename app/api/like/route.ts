import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/like
 * body: { answerId: number }
 *
 * - 未ログイン → 401
 * - answerId が存在しない → 404
 * - いいね済み → 削除（解除）
 * - 未いいね  → 作成
 * レスポンス: { liked: boolean; count: number }
 */
export async function POST(req: NextRequest) {
  // ── 認証チェック ───────────────────────────────────────
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  // ── リクエストボディ ───────────────────────────────────
  let answerId: number;
  try {
    const body = await req.json();
    answerId = Number(body.answerId);
    if (!Number.isInteger(answerId) || answerId <= 0) throw new Error();
  } catch {
    return NextResponse.json({ error: "answerId が無効です" }, { status: 400 });
  }

  const userId = session.user.id;

  try {
    // ── Answer 存在確認 ────────────────────────────────────
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: { id: true },
    });
    if (!answer) {
      return NextResponse.json({ error: "回答が見つかりません" }, { status: 404 });
    }

    // ── トグル処理 ────────────────────────────────────────
    const existing = await prisma.like.findUnique({
      where: { userId_answerId: { userId, answerId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({ data: { userId, answerId } });
    }

    // ── 最新カウントを返す ────────────────────────────────
    const count = await prisma.like.count({ where: { answerId } });
    return NextResponse.json({ liked: !existing, count });
  } catch (err) {
    console.error("[POST /api/like]", err);
    return NextResponse.json({ error: "いいねの処理に失敗しました" }, { status: 500 });
  }
}
