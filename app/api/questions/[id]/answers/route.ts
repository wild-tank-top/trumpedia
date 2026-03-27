import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/questions/[id]/answers - 回答投稿（fellowロール以上のみ）
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }
  if (session.user.role !== "fellow" && session.user.role !== "admin") {
    return NextResponse.json({ error: "回答はFellowユーザーのみ可能です" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { summary, causeAnalysis, thinking, approach, ngExamples, exceptions, philosophy } = body;

  if (!summary || !causeAnalysis || !thinking || !approach) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const answer = await prisma.answer.create({
    data: {
      questionId: Number(id),
      userId: session.user.id,
      summary,
      causeAnalysis,
      thinking,
      approach,
      ngExamples: ngExamples ?? "",
      exceptions: exceptions ?? "",
      philosophy: philosophy ?? "",
    },
  });
  return NextResponse.json(answer, { status: 201 });
}
