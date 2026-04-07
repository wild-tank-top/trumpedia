import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ site: [], mine: [] });
  }

  const userId = session.user.id;
  const sinceParam = req.nextUrl.searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 60 * 60 * 1000);

  const [siteAnswers, myAnswers] = await Promise.all([
    // 他の人がサイト全体に投稿した回答
    prisma.answer.findMany({
      where: {
        createdAt: { gt: since },
        userId: { not: userId },
      },
      select: {
        id: true,
        questionId: true,
        createdAt: true,
        user:     { select: { name: true } },
        question: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }).catch(() => []),

    // 自分の質問への新しい回答
    prisma.answer.findMany({
      where: {
        createdAt: { gt: since },
        userId: { not: userId },
        question: { userId },
      },
      select: {
        id: true,
        questionId: true,
        createdAt: true,
        user:     { select: { name: true } },
        question: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }).catch(() => []),
  ]);

  const site = siteAnswers.map((a) => ({
    id:            a.id,
    type:          "site" as const,
    questionId:    a.questionId,
    questionTitle: a.question.title,
    actorName:     a.user.name ?? "Fellow",
    createdAt:     a.createdAt.toISOString(),
  }));

  const mine = myAnswers.map((a) => ({
    id:            a.id,
    type:          "mine" as const,
    questionId:    a.questionId,
    questionTitle: a.question.title,
    actorName:     a.user.name ?? "Fellow",
    createdAt:     a.createdAt.toISOString(),
  }));

  return NextResponse.json({ site, mine });
}
