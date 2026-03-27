import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/account - アカウント削除（退会処理）
// - Answer は Cascade で自動削除
// - Question.userId は SetNull で null に（コンテンツは残す）
// - Profile / Account / Session / Like は Cascade で自動削除
export async function DELETE() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const userId = session.user.id;

  // Question の userId を明示的に null にしてからユーザー削除
  // （DBレベルの SetNull に頼るが、念のため明示実行）
  await prisma.$transaction(async (tx) => {
    await tx.question.updateMany({
      where: { userId },
      data: { userId: null },
    });
    await tx.user.delete({ where: { id: userId } });
  });

  return NextResponse.json({ ok: true });
}
