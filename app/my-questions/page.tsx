import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { LEVEL_LABELS, LEVEL_STYLES, DEFAULT_LEVEL_STYLE } from "@/lib/levelConfig";
import { isManagedThumbnail, getAutoThumbnail } from "@/lib/thumbnails";
import ThumbnailImage from "@/app/components/ThumbnailImage";
import { Clock, CheckCircle, MessageSquare, Eye } from "lucide-react";

export const metadata: Metadata = { title: "自分の質問 | Trumpedia" };

const STATUS_CONFIG = {
  pending: {
    label: "承認待ち",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  },
  approved: {
    label: "承認済み",
    icon: CheckCircle,
    className: "bg-teal-100 text-teal-700 border border-teal-200",
  },
} as const;

export default async function MyQuestionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const questions = await prisma.question.findMany({
    where: {
      userId,
      status: { not: "rejected" },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      level: true,
      status: true,
      thumbnail: true,
      createdAt: true,
      views: true,
      _count: { select: { answers: true } },
    },
  });

  const pendingCount  = questions.filter((q) => q.status === "pending").length;
  const approvedCount = questions.filter((q) => q.status === "approved").length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">自分の質問</h1>
        <p className="text-sm text-gray-500 mt-1">
          投稿した質問の一覧と承認状況を確認できます
        </p>
      </div>

      {/* サマリーバッジ */}
      {questions.length > 0 && (
        <div className="flex gap-3 mb-6 flex-wrap">
          <span className="text-sm text-gray-500">
            全 <span className="font-semibold text-gray-800">{questions.length}</span> 件
          </span>
          {pendingCount > 0 && (
            <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2.5 py-0.5 rounded-full font-medium">
              承認待ち {pendingCount}件
            </span>
          )}
          {approvedCount > 0 && (
            <span className="text-xs bg-teal-100 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full font-medium">
              承認済み {approvedCount}件
            </span>
          )}
        </div>
      )}

      {/* 質問リスト */}
      {questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">🎺</p>
          <p className="text-gray-500 font-medium mb-1">まだ質問がありません</p>
          <p className="text-sm text-gray-400 mb-6">
            疑問に思ったことを質問してみましょう
          </p>
          <Link
            href="/questions/new"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors"
          >
            質問を投稿する
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => {
            const ls = LEVEL_STYLES[q.level] ?? DEFAULT_LEVEL_STYLE;
            const status = STATUS_CONFIG[q.status as keyof typeof STATUS_CONFIG];
            const StatusIcon = status.icon;
            const src = isManagedThumbnail(q.thumbnail)
              ? q.thumbnail!
              : getAutoThumbnail(q.id);

            return (
              <Link
                key={q.id}
                href={`/questions/${q.id}`}
                className={`flex gap-4 bg-white rounded-xl border ${ls.cardBorder} p-4 hover:shadow-md transition-all group`}
              >
                {/* サムネイル */}
                <div className="w-28 sm:w-36 shrink-0 rounded-lg overflow-hidden aspect-video self-start">
                  <ThumbnailImage src={src} title={q.title} />
                </div>

                {/* コンテンツ */}
                <div className="flex-1 min-w-0">
                  {/* ステータス + カテゴリ */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.className}`}>
                      <StatusIcon size={10} />
                      {status.label}
                    </span>
                    {q.category.split(",").map((cat) => (
                      <span key={cat} className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {cat.trim()}
                      </span>
                    ))}
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${ls.badge}`}>
                      {LEVEL_LABELS[q.level] ?? q.level}
                    </span>
                  </div>

                  {/* タイトル */}
                  <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-teal-700 transition-colors mb-2">
                    {q.title}
                  </p>

                  {/* 日付 + カウント */}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{new Date(q.createdAt).toLocaleDateString("ja-JP")}</span>
                    <span className="flex items-center gap-0.5">
                      <MessageSquare size={11} />
                      {q._count.answers}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Eye size={11} />
                      {q.views.toLocaleString()}
                    </span>
                  </div>

                  {/* 承認待ちの注意書き */}
                  {q.status === "pending" && (
                    <p className="text-[11px] text-yellow-600 mt-2">
                      管理者が承認すると公開されます
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* 質問投稿CTA */}
      {questions.length > 0 && (
        <div className="mt-6 text-center">
          <Link
            href="/questions/new"
            className="inline-block text-sm text-teal-600 hover:text-teal-700 border border-teal-200 hover:border-teal-300 px-5 py-2 rounded-full transition-colors"
          >
            新しい質問を投稿する
          </Link>
        </div>
      )}
    </div>
  );
}
