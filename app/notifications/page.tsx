import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Bell } from "lucide-react";

export const metadata: Metadata = { title: "通知 | Trumpedia" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const notifications = await prisma.notification
    .findMany({
      where: { userId: session.user.id, isRead: false },
      include: {
        question: { select: { id: true, title: true, category: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  // 各質問の最新補足を取得（テーブル未作成でも空Mapで続行）
  const questionIds = notifications.map((n) => n.questionId);
  const latestSupplements =
    questionIds.length > 0
      ? await prisma.questionSupplement
          .findMany({
            where: { questionId: { in: questionIds } },
            orderBy: { createdAt: "desc" },
          })
          .catch(() => [])
          .then((sups) => {
            const map = new Map<number, { content: string; createdAt: Date }>();
            for (const s of sups) {
              if (!map.has(s.questionId)) map.set(s.questionId, s);
            }
            return map;
          })
      : new Map<number, { content: string; createdAt: Date }>();

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Bell size={20} className="text-teal-600" />
        <h1 className="text-2xl font-bold text-gray-900">未読通知</h1>
        {notifications.length > 0 && (
          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
            {notifications.length} 件
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Bell size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">未読の通知はありません</p>
          <p className="text-sm mt-1">補足が追加されると、ここに表示されます</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const supplement = latestSupplements.get(n.questionId);
            return (
              <Link
                key={n.id}
                href={`/questions/${n.question.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded shrink-0 mt-0.5">
                    補足あり
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs text-gray-400">{n.question.category}</span>
                    </div>
                    <p className="font-medium text-gray-900 truncate">{n.question.title}</p>
                    {supplement && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {supplement.content}
                      </p>
                    )}
                    {supplement && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(supplement.createdAt).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                  <span className="text-gray-300 shrink-0">›</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
