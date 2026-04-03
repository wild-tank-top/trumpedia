import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

/** POST: 招待コードで Fellows 参加申請 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  if (session.user.role !== "guest") {
    return NextResponse.json({ error: "すでに Fellow またはそれ以上のロールです" }, { status: 400 });
  }

  const { code } = await req.json().catch(() => ({})) as { code?: string };
  if (!code?.trim()) return NextResponse.json({ error: "招待コードを入力してください" }, { status: 400 });

  // 既存の申請チェック
  const existing = await prisma.fellowApplication.findUnique({
    where: { applicantId: session.user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "すでに申請済みです" }, { status: 400 });
  }

  // コードの検証
  const inviteCode = await prisma.inviteCode.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: { issuer: { select: { id: true, name: true, role: true } } },
  });

  if (!inviteCode) return NextResponse.json({ error: "招待コードが見つかりません" }, { status: 404 });
  if (inviteCode.usedAt) return NextResponse.json({ error: "このコードはすでに使用済みです" }, { status: 400 });
  if (inviteCode.expiresAt < new Date()) return NextResponse.json({ error: "このコードの有効期限が切れています" }, { status: 400 });
  if (inviteCode.issuerId === session.user.id) {
    return NextResponse.json({ error: "自分が発行したコードは使用できません" }, { status: 400 });
  }
  if (inviteCode.issuer.role !== "fellow" && inviteCode.issuer.role !== "admin") {
    return NextResponse.json({ error: "このコードは有効ではありません" }, { status: 400 });
  }

  // コード使用済みにして申請レコード作成（トランザクション）
  const application = await prisma.$transaction(async (tx) => {
    await tx.inviteCode.update({
      where: { id: inviteCode.id },
      data: { usedAt: new Date(), usedById: session.user.id },
    });
    return tx.fellowApplication.create({
      data: {
        id: nanoid(),
        applicantId: session.user.id,
        referrerId: inviteCode.issuerId,
        inviteCodeId: inviteCode.id,
        status: "pending",
      },
    });
  });

  return NextResponse.json({ application }, { status: 201 });
}
