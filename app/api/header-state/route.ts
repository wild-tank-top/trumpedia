import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTier } from "@/lib/answerTier";
import { isAdmin } from "@/lib/roles";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({
      notifications: [],
      unreadCount: 0,
      tierRingClass: "",
      adminPendingCount: 0,
    });
  }

  const userId = session.user.id;
  const admin = isAdmin(session.user.role);

  const [notifications, answerCount, adminPendingCount] = await Promise.all([
    prisma.notification
      .findMany({
        where: { userId, isRead: false },
        select: {
          id: true,
          questionId: true,
          question: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
      .catch(() => []),
    prisma.answer.count({ where: { userId } }).catch(() => 0),
    admin
      ? prisma.fellowApplication
          .count({ where: { status: "referrer_approved" } })
          .catch(() => 0)
      : Promise.resolve(0),
  ]);

  return NextResponse.json({
    notifications,
    unreadCount: notifications.length,
    tierRingClass: getTier(answerCount).ring,
    adminPendingCount,
  });
}

