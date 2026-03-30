import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["approved", "rejected", "pending"] as const;
type Status = (typeof VALID_STATUSES)[number];

// PATCH /api/admin/questions/[id] - 質問ステータス変更（adminのみ）
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status as Status)) {
    return NextResponse.json({ error: "無効なステータスです" }, { status: 400 });
  }

  try {
    const question = await prisma.question.update({
      where: { id: Number(id) },
      data: { status },
    });
    return NextResponse.json(question);
  } catch (err) {
    console.error("[PATCH /api/admin/questions]", err);
    return NextResponse.json({ error: "ステータスの更新に失敗しました" }, { status: 500 });
  }
}
