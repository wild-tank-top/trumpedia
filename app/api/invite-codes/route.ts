import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

const MAX_ACTIVE_CODES = 3;
const EXPIRE_HOURS = 24;

/** 未使用かつ有効期限内のコード数を数える */
async function countActiveCodes(issuerId: string) {
  return prisma.inviteCode.count({
    where: {
      issuerId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
}

/** GET: 自分が発行したコード一覧（期限内のみ） */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  if (session.user.role !== "fellow" && session.user.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const codes = await prisma.inviteCode.findMany({
    where: { issuerId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      usedBy: { select: { name: true, email: true } },
      application: { select: { status: true } },
    },
  });

  return NextResponse.json({ codes });
}

/** POST: 新しい招待コードを発行 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  if (session.user.role !== "fellow" && session.user.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const activeCount = await countActiveCodes(session.user.id);
  if (activeCount >= MAX_ACTIVE_CODES) {
    return NextResponse.json(
      { error: `有効な招待コードは最大${MAX_ACTIVE_CODES}つまでです。期限切れ・使用済みのコードを確認してください。` },
      { status: 400 }
    );
  }

  // 衝突しないユニークなコードを生成（8文字英数字大文字）
  let code: string;
  let attempts = 0;
  do {
    code = nanoid(8).toUpperCase().replace(/[^A-Z0-9]/g, "X").slice(0, 8);
    const exists = await prisma.inviteCode.findUnique({ where: { code } });
    if (!exists) break;
    attempts++;
  } while (attempts < 10);

  const expiresAt = new Date(Date.now() + EXPIRE_HOURS * 60 * 60 * 1000);
  const inviteCode = await prisma.inviteCode.create({
    data: { id: nanoid(), code, issuerId: session.user.id, expiresAt },
  });

  return NextResponse.json({ inviteCode }, { status: 201 });
}
