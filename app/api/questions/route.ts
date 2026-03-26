import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/questions - 承認済み質問一覧取得
export async function GET() {
  const questions = await prisma.question.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { answers: true } } },
  });
  return NextResponse.json(questions);
}

// POST /api/questions - 質問投稿（ログイン推奨、pendingで登録）
export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();
  const { title, category, level, content } = body;

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
      userId: session?.user.id ?? null,
    },
  });
  return NextResponse.json(question, { status: 201 });
}
