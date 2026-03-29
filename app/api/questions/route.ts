import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getDefaultImage } from "@/lib/defaultImages";

// GET /api/questions - 承認済み質問一覧取得
export async function GET() {
  const questions = await prisma.question.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { answers: true } } },
  });
  return NextResponse.json(questions);
}

// POST /api/questions - 質問投稿（guest以上のログインユーザーのみ）
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body = await req.json();
  const { title, category, level, content, thumbnail } = body;

  if (!title || !category || !level || !content) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const question = await prisma.question.create({
    data: {
      title,
      category,
      level,
      content,
      status: "pending",
      userId: session.user.id,
      // thumbnail 未指定時は難易度に対応するピクトグラムを自動割り当て
      thumbnail: thumbnail ? String(thumbnail) : getDefaultImage(level),
    },
  });
  return NextResponse.json(question, { status: 201 });
}
