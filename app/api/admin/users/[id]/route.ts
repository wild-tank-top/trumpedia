import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin, isMasterAdmin, requiresMasterAdmin } from "@/lib/roles";

const VALID_ROLES = ["guest", "fellow", "admin", "admin_fellow", "master_admin"] as const;
type Role = (typeof VALID_ROLES)[number];

// PATCH /api/admin/users/[id] - ロール変更
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const { id } = await params;
  const { role } = await req.json();

  if (!VALID_ROLES.includes(role as Role)) {
    return NextResponse.json({ error: "無効なロールです" }, { status: 400 });
  }

  // admin/master_admin への変更・からの変更は master_admin のみ
  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!targetUser) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  if (
    (requiresMasterAdmin(role) || requiresMasterAdmin(targetUser.role)) &&
    !isMasterAdmin(session.user.role)
  ) {
    return NextResponse.json(
      { error: "この操作はマスター管理者のみ実行できます" },
      { status: 403 }
    );
  }

  // 自分自身のロールを下げることを防ぐ
  if (session.user.id === id && !requiresMasterAdmin(role)) {
    return NextResponse.json(
      { error: "自分自身の管理者ロールを外すことはできません" },
      { status: 400 }
    );
  }

  // guest に戻す場合: FellowApplication をリセット
  if (role === "guest") {
    await prisma.$transaction(async (tx) => {
      const app = await tx.fellowApplication.findUnique({
        where: { applicantId: id },
        select: { inviteCodeId: true },
      });
      if (app) {
        if (app.inviteCodeId) {
          await tx.inviteCode.update({
            where: { id: app.inviteCodeId },
            data: { usedAt: null, usedById: null },
          });
        }
        await tx.fellowApplication.delete({ where: { applicantId: id } });
      }
      await tx.user.update({ where: { id }, data: { role } });
    });

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, role: true },
    });
    return NextResponse.json(user);
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, role: true },
  });

  return NextResponse.json(user);
}
