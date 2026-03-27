import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/answers/[id]/like - いいねのトグル（ログイン必須）
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { id } = await params;
  const answerId = Number(id);
  const userId = session.user.id;

  const existing = await prisma.like.findUnique({
    where: { userId_answerId: { userId, answerId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId, answerId } });
  }

  const count = await prisma.like.count({ where: { answerId } });
  return NextResponse.json({ liked: !existing, count });
}
