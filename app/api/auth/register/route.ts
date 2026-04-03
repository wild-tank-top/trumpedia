import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  let name: string, email: string, password: string, inviteCode: string | undefined;
  try {
    const body = await req.json();
    name       = String(body.name       ?? "").trim();
    email      = String(body.email      ?? "").trim().toLowerCase();
    password   = String(body.password   ?? "");
    inviteCode = body.inviteCode ? String(body.inviteCode).trim().toUpperCase() : undefined;
  } catch {
    return NextResponse.json({ error: "リクエストの形式が正しくありません" }, { status: 400 });
  }

  if (!name || !email || !password) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "パスワードは8文字以上にしてください" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "メールアドレスの形式が正しくありません" }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "このメールアドレスは既に使用されています" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user   = await prisma.user.create({
      data: { name, email, password: hashed, role: "guest" },
    });

    // 招待コードが入力されていた場合、申請を自動作成（失敗しても登録は完了）
    if (inviteCode) {
      try {
        const code = await prisma.inviteCode.findUnique({
          where: { code: inviteCode },
          include: { issuer: { select: { role: true } } },
        });
        if (
          code &&
          !code.usedAt &&
          code.expiresAt > new Date() &&
          (code.issuer.role === "fellow" || code.issuer.role === "admin")
        ) {
          await prisma.$transaction([
            prisma.inviteCode.update({
              where: { id: code.id },
              data: { usedAt: new Date(), usedById: user.id },
            }),
            prisma.fellowApplication.create({
              data: {
                id: nanoid(),
                applicantId:  user.id,
                referrerId:   code.issuerId,
                inviteCodeId: code.id,
                status:       "pending",
              },
            }),
          ]);
        }
      } catch {
        // 招待コード処理が失敗しても登録自体は成功
      }
    }

    return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "登録処理に失敗しました。もう一度お試しください。" }, { status: 500 });
  }
}
