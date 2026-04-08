import { isFellow, isAdmin } from "@/lib/roles";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

function requireFellow(session: Session | null) {
  if (!session) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  if (!isFellow(session.user.role) && !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "回答はFellowユーザーのみ可能です" }, { status: 403 });
  }
  return null;
}

function parseBody(body: Record<string, unknown>) {
  const { summary, causeAnalysis, thinking, approach, ngExamples, exceptions, philosophy } = body;
  if (!summary || !approach) return null;
  return {
    summary: String(summary),
    causeAnalysis: causeAnalysis ? String(causeAnalysis) : "",
    thinking: thinking ? String(thinking) : "",
    approach: String(approach),
    ngExamples: ngExamples ? String(ngExamples) : "",
    exceptions: exceptions ? String(exceptions) : "",
    philosophy: philosophy ? String(philosophy) : "",
  };
}

// POST /api/questions/[id]/answers - 新規回答投稿（1ユーザー1回答）
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const authError = requireFellow(session);
  if (authError) return authError;

  const { id } = await params;
  const questionId = Number(id);

  // 既に回答済みかチェック
  const existing = await prisma.answer.findFirst({
    where: { questionId, userId: session!.user.id },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "この質問にはすでに回答済みです。編集フォームから更新してください。" },
      { status: 409 }
    );
  }

  const fields = parseBody(await req.json());
  if (!fields) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const now = new Date();
  const [answer] = await prisma.$transaction([
    prisma.answer.create({
      data: { questionId, userId: session!.user.id, ...fields },
    }),
    prisma.question.update({
      where: { id: questionId },
      data: { lastAnsweredAt: now },
    }),
  ]);

  const totalAnswerCount = await prisma.answer.count({
    where: { userId: session!.user.id },
  });

  return NextResponse.json({ ...answer, totalAnswerCount }, { status: 201 });
}

// PUT /api/questions/[id]/answers - 既存回答を更新
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const authError = requireFellow(session);
  if (authError) return authError;

  const { id } = await params;
  const questionId = Number(id);

  const existing = await prisma.answer.findFirst({
    where: { questionId, userId: session!.user.id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "更新対象の回答が見つかりません" }, { status: 404 });
  }

  const fields = parseBody(await req.json());
  if (!fields) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const answer = await prisma.answer.update({
    where: { id: existing.id },
    data: fields,
  });
  return NextResponse.json(answer);
}
