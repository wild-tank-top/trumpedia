import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/profile/[id] - プロフィール取得（公開）
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
      profile: true,
      answers: {
        orderBy: { createdAt: "desc" },
        include: {
          question: {
            select: { id: true, title: true, category: true, status: true },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }
  return NextResponse.json(user);
}

// PUT /api/profile/[id] - プロフィール更新（本人 or admin）
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }
  if (session.user.id !== id && session.user.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const body = await req.json();
  const { name, yomi, bio, career, twitter, youtube, instagram, website } = body;

  // URLフィールドのバリデーション
  const urlFields: { value: string | undefined; label: string }[] = [
    { value: youtube, label: "YouTube" },
    { value: website, label: "Webサイト" },
  ];
  for (const { value, label } of urlFields) {
    if (value && value.trim() !== "" && !value.startsWith("https://")) {
      return NextResponse.json(
        { error: `${label}のURLは https:// から始めてください` },
        { status: 400 }
      );
    }
  }

  // callback形式のtransaction（エラー時は自動ロールバック）
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: { name: name?.trim() || undefined },
    });
    await tx.profile.upsert({
      where: { userId: id },
      create: {
        userId: id,
        yomi: yomi?.trim() ?? "",
        bio: bio ?? "",
        career: career ?? "",
        twitter: twitter ?? "",
        youtube: youtube ?? "",
        instagram: instagram ?? "",
        website: website ?? "",
      },
      update: {
        yomi: yomi?.trim() ?? "",
        bio: bio ?? "",
        career: career ?? "",
        twitter: twitter ?? "",
        youtube: youtube ?? "",
        instagram: instagram ?? "",
        website: website ?? "",
      },
    });
  });

  return NextResponse.json({ ok: true });
}
