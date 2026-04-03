import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

/** DELETE: 未使用コードを取り消し */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  const code = await prisma.inviteCode.findUnique({ where: { id } });
  if (!code) return NextResponse.json({ error: "コードが見つかりません" }, { status: 404 });
  if (code.issuerId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }
  if (code.usedAt) {
    return NextResponse.json({ error: "使用済みのコードは削除できません" }, { status: 400 });
  }

  await prisma.inviteCode.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
