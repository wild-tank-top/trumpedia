import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/fellow-applications/[id]
 * body: { action: "refer", note: string } | { action: "complete" } | { action: "reject" }
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  const body = await req.json().catch(() => ({})) as { action?: string; note?: string };
  const { action, note } = body;

  const application = await prisma.fellowApplication.findUnique({
    where: { id },
    include: { applicant: true, referrer: true },
  });
  if (!application) return NextResponse.json({ error: "申請が見つかりません" }, { status: 404 });

  // ── 紹介者による承認 ──────────────────────────────────────────
  if (action === "refer") {
    if (session.user.id !== application.referrerId) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }
    if (application.status !== "pending") {
      return NextResponse.json({ error: "この申請はすでに処理済みです" }, { status: 400 });
    }
    if (!note?.trim() || note.trim().length < 10) {
      return NextResponse.json(
        { error: "申請者の専門性・活動内容を10文字以上入力してください" },
        { status: 400 }
      );
    }

    await prisma.fellowApplication.update({
      where: { id },
      data: { status: "referrer_approved", referrerNote: note.trim() },
    });

    revalidatePath("/admin");
    return NextResponse.json({ ok: true });
  }

  // ── 管理者による最終承認 ───────────────────────────────────────
  if (action === "complete") {
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }
    if (application.status !== "referrer_approved") {
      return NextResponse.json({ error: "紹介者の承認が完了していません" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: application.applicantId },
        data: { role: "fellow" },
      }),
      prisma.fellowApplication.update({
        where: { id },
        data: { status: "admin_completed" },
      }),
    ]);

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return NextResponse.json({ ok: true });
  }

  // ── 管理者による却下 ──────────────────────────────────────────
  if (action === "reject") {
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    await prisma.fellowApplication.update({
      where: { id },
      data: { status: "rejected" },
    });

    revalidatePath("/admin");
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "不正なアクションです" }, { status: 400 });
}
