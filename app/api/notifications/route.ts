import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/notifications
// 指定 questionId に紐づく未読通知を既読にする。
// 既読化した件数を返す（0 なら画面更新不要の判断に使う）。
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { questionId } = await req.json();

  const { count } = await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      questionId: Number(questionId),
      isRead: false,
    },
    data: { isRead: true },
  });

  return NextResponse.json({ count });
}
