import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/questions/[id]/view
 *
 * 質問の閲覧数を +1 する。
 * - 認証不要（未ログイン訪問者の閲覧も計測）
 * - `increment` を使いアトミックに更新（競合状態を防止）
 * - クライアントの useEffect から1回だけ呼ばれることを前提とする
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const questionId = Number(id);

  if (!Number.isInteger(questionId) || questionId <= 0) {
    return NextResponse.json({ error: "無効なID" }, { status: 400 });
  }

  // 存在しない Question へのリクエストは 404（余分な increment を防ぐ）
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true },
  });
  if (!question) {
    return NextResponse.json({ error: "質問が見つかりません" }, { status: 404 });
  }

  const [updated] = await prisma.$transaction([
    prisma.question.update({
      where: { id: questionId },
      data: { views: { increment: 1 } },
      select: { views: true },
    }),
    prisma.pageView.create({ data: {} }),
  ]);

  return NextResponse.json({ views: updated.views });
}
