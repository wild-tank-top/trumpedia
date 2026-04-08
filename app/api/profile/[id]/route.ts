import { isAdmin } from "@/lib/roles";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/profile/[id] - プロフィール取得（公開）
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
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
  } catch (err) {
    console.error("[GET /api/profile]", err);
    return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
  }
}

// PUT /api/profile/[id] - プロフィール更新（本人 or admin）
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }
  if (session.user.id !== id && !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエストの形式が正しくありません" }, { status: 400 });
  }

  const { name, yomi, bio, career, dream, twitter, youtube, instagram, website } = body as Record<string, string | undefined>;

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

  // 入力長チェック
  if (bio && bio.length > 1000) {
    return NextResponse.json({ error: "自己紹介は1000文字以内で入力してください" }, { status: 400 });
  }
  if (career && career.length > 500) {
    return NextResponse.json({ error: "経歴は500文字以内で入力してください" }, { status: 400 });
  }
  if (dream && dream.length > 500) {
    return NextResponse.json({ error: "夢・目標は500文字以内で入力してください" }, { status: 400 });
  }

  try {
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
          dream: dream ?? "",
          twitter: twitter ?? "",
          youtube: youtube ?? "",
          instagram: instagram ?? "",
          website: website ?? "",
        },
        update: {
          yomi: yomi?.trim() ?? "",
          bio: bio ?? "",
          career: career ?? "",
          dream: dream ?? "",
          twitter: twitter ?? "",
          youtube: youtube ?? "",
          instagram: instagram ?? "",
          website: website ?? "",
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/profile]", err);
    return NextResponse.json({ error: "プロフィールの更新に失敗しました" }, { status: 500 });
  }
}
