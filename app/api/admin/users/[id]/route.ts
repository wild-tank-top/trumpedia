import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const VALID_ROLES = ["guest", "pro", "admin"] as const;
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

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(user);
}
