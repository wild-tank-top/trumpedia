import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CategoryFilter from "./CategoryFilter";

export const dynamic = "force-dynamic";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced: "bg-red-100 text-red-700",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const questions = await prisma.question.findMany({
    where: {
      status: "approved",
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: "desc" },
    // thumbnail は一覧では未表示のため select から除外（DBカラム依存を回避）
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      level: true,
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
            <Link href="/contributors" className="text-sm text-gray-400 hover:underline">
              回答者一覧 →
            </Link>
          </div>
        </div>
      </div>

      {/* カテゴリフィルター（Client Component） */}
      <CategoryFilter current={category} />

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
          {questions.map((q) => (
            <Link
              key={q.id}
              href={`/questions/${q.id}`}
              className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all"
            >
              {/* TODO: AIサムネイル追加後ここに表示 */}
              <div className="aspect-video bg-gradient-to-br from-teal-50 to-gray-100 rounded-t-xl flex items-center justify-center">
                <span className="text-3xl opacity-40">🎺</span>
              </div>

              <div className="p-4">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                    {q.category}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      LEVEL_COLORS[q.level] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
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
          ))}
        </div>
      )}
    </div>
  );
}
