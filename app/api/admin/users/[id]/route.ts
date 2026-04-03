import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const VALID_ROLES = ["guest", "fellow", "admin"] as const;
type Role = (typeof VALID_ROLES)[number];

// PATCH /api/admin/users/[id] - ロール変更（adminのみ）
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const { id } = await params;
  const { role } = await req.json();

  if (!VALID_ROLES.includes(role as Role)) {
    return NextResponse.json({ error: "無効なロールです" }, { status: 400 });
  }

  // 自分自身のロールをguestに落とす操作を防ぐ
  if (session.user.id === id && role !== "admin") {
    return NextResponse.json(
      { error: "自分自身のadminロールを外すことはできません" },
      { status: 400 }
    );
  }

  // guest に戻す場合: FellowApplication を削除し再申請できるようにする
  if (role === "guest") {
    await prisma.$transaction(async (tx) => {
      const app = await tx.fellowApplication.findUnique({
        where: { applicantId: id },
        select: { inviteCodeId: true },
      });
      if (app) {
        // 使用済みの招待コードもリセット（再利用可能にする）
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
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json(user);
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(user);
}
