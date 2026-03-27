import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/questions/[id] - 質問詳細取得（回答含む）
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const question = await prisma.question.findUnique({
    where: { id: Number(id) },
    include: { answers: { orderBy: { createdAt: "asc" } } },
  });

  if (!question) {
    return NextResponse.json({ error: "質問が見つかりません" }, { status: 404 });
  }
  return NextResponse.json(question);
}

// PUT /api/questions/[id] - 質問編集（投稿者 or admin のみ）
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { id } = await params;
  const question = await prisma.question.findUnique({ where: { id: Number(id) } });
  if (!question) {
    return NextResponse.json({ error: "質問が見つかりません" }, { status: 404 });
  }

  if (session.user.id !== question.userId && session.user.role !== "admin") {
    return NextResponse.json({ error: "権限なし" }, { status: 403 });
  }

  const body = await req.json();
  const { title, category, level, content } = body;

  if (!title || !category || !level || !content) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const updated = await prisma.question.update({
    where: { id: Number(id) },
    data: { title, category, level, content },
  });
  return NextResponse.json(updated);
}

// DELETE /api/questions/[id] - 質問削除（投稿者 or admin のみ）
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { id } = await params;
  const question = await prisma.question.findUnique({
    where: { id: Number(id) },
    select: { userId: true },
  });

  if (!question) {
    return NextResponse.json({ error: "質問が見つかりません" }, { status: 404 });
  }

  if (session.user.id !== question.userId && session.user.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  await prisma.question.delete({ where: { id: Number(id) } });

  return NextResponse.json({ ok: true });
}
