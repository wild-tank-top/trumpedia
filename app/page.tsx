import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CategoryFilter from "./CategoryFilter";
import SortControl from "./SortControl";
import { LEVEL_LABELS, LEVEL_STYLES, DEFAULT_LEVEL_STYLE } from "@/lib/levelConfig";
import { getDefaultImage } from "@/lib/defaultImages";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type SortKey = "createdAt" | "views" | "answers" | "lastAnsweredAt";
type OrderDir = "asc" | "desc";

const VALID_SORTS: SortKey[] = ["createdAt", "views", "answers", "lastAnsweredAt"];
const VALID_ORDERS: OrderDir[] = ["asc", "desc"];

function buildOrderBy(sort: SortKey, order: OrderDir): Prisma.QuestionOrderByWithRelationInput[] {
  if (sort === "answers") {
    return [{ answers: { _count: order } }, { createdAt: "desc" }];
  }
  if (sort === "lastAnsweredAt") {
    return [{ lastAnsweredAt: { sort: order, nulls: "last" } }, { createdAt: "desc" }];
  }
  return [{ [sort]: order }];
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; order?: string }>;
}) {
  const { category, sort: sortParam, order: orderParam } = await searchParams;

  const sort: SortKey = VALID_SORTS.includes(sortParam as SortKey)
    ? (sortParam as SortKey)
    : "createdAt";
  const order: OrderDir = VALID_ORDERS.includes(orderParam as OrderDir)
    ? (orderParam as OrderDir)
    : "desc";

  const questions = await prisma.question.findMany({
    where: {
      status: "approved",
      ...(category ? { category } : {}),
    },
    orderBy: buildOrderBy(sort, order),
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      level: true,
      thumbnail: true,
      createdAt: true,
      _count: { select: { answers: true } },
    },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">質問一覧</h1>
            <p className="text-gray-500 text-sm mt-1">
              トランペット奏者の知見・思考プロセスを蓄積しています
            </p>
          </div>
          <div className="flex items-center gap-4 hidden sm:flex">
            <Link href="/fellows" className="text-sm text-teal-600 hover:underline">
              Fellows →
            </Link>
          </div>
        </div>
      </div>

      {/* カテゴリフィルター（Client Component） */}
      <CategoryFilter current={category} />

      {/* ソートコントロール + モバイルドロワー */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400">
          {questions.length}件
        </p>
        <SortControl currentSort={sort} currentOrder={order} />
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🎺</p>
          {category ? (
            <>
              <p className="text-lg font-medium">「{category}」の質問はまだありません</p>
              <Link
                href="/"
                className="inline-block mt-4 text-sm text-teal-600 hover:underline"
              >
                すべての質問を見る
              </Link>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">まだ質問がありません</p>
              <p className="text-sm mt-1">最初の質問を投稿してみましょう！</p>
              <Link
                href="/questions/new"
                className="inline-block mt-4 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full text-sm transition-colors"
              >
                質問を投稿する
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {questions.map((q) => {
            const s = LEVEL_STYLES[q.level] ?? DEFAULT_LEVEL_STYLE;
            return (
              <Link
                key={q.id}
                href={`/questions/${q.id}`}
                className={`block bg-white rounded-xl border shadow-sm ${s.cardBorder} ${s.cardHover} transition-all overflow-hidden`}
              >
                {/* 難易度カラーバー（上端） */}
                <div className={`h-1 w-full ${s.bar}`} />

                {/* サムネイル / デフォルト画像 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={q.thumbnail ?? getDefaultImage(q.level)}
                  alt={q.title}
                  className="w-full aspect-video object-cover"
                />

                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {q.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.badge}`}>
                      {LEVEL_LABELS[q.level] ?? q.level}
                    </span>
                  </div>

                  <p className="font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
                    {q.title}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
                    {q.content}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{new Date(q.createdAt).toLocaleDateString("ja-JP")}</span>
                    <span>回答 {q._count.answers}件</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
