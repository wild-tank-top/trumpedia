import { isAdmin } from "@/lib/roles";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// POST /api/questions/[id]/supplements
// 質問者本人のみ補足を投稿できる。投稿時に回答者全員へ通知を生成する。
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  try {
    const question = await prisma.question.findUnique({
      where: { id: Number(id) },
      select: {
        userId: true,
        answers: { select: { userId: true } },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "質問が見つかりません" }, { status: 404 });
    }

    if (question.userId !== session.user.id && !isAdmin(session.user.role)) {
      return NextResponse.json({ error: "質問の投稿者のみ補足を投稿できます" }, { status: 403 });
    }

    let content: string;
    try {
      const body = await req.json();
      content = String(body.content ?? "").trim();
    } catch {
      return NextResponse.json({ error: "リクエストの形式が正しくありません" }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "補足内容を入力してください" }, { status: 400 });
    }

    // 回答者のうち、質問者自身を除いたユニークな userId に通知を送る
    const notifyUserIds = [
      ...new Set(
        question.answers
          .map((a) => a.userId)
          .filter((uid) => uid !== session.user.id)
      ),
    ];

    await prisma.$transaction(async (tx) => {
      await tx.questionSupplement.create({
        data: { questionId: Number(id), content },
      });

      // upsert で既読済みの通知も「未読」に戻す（新しい補足を見逃さない）
      if (notifyUserIds.length > 0) {
        await Promise.all(
          notifyUserIds.map((userId) =>
            tx.notification.upsert({
              where: {
                userId_questionId_type: {
                  userId,
                  questionId: Number(id),
                  type: "supplement",
                },
              },
              create: { userId, questionId: Number(id), type: "supplement" },
              update: { isRead: false, createdAt: new Date() },
            })
          )
        );
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/questions/supplements]", err);
    return NextResponse.json({ error: "補足の投稿に失敗しました" }, { status: 500 });
  }
}
