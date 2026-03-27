import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const answer = await prisma.answer.findUnique({
    where: { id: Number(id) },
    select: { userId: true },
  });

  if (!answer) {
    return NextResponse.json({ error: "回答が見つかりません" }, { status: 404 });
  }

  if (answer.userId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  await prisma.answer.delete({ where: { id: Number(id) } });

  return NextResponse.json({ ok: true });
}
