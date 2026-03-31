import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CategoryFilter from "./CategoryFilter";
import SortControl from "./SortControl";
import AIChatNavigator from "./AIChatNavigator";
import SearchBox from "./SearchBox";
import Pagination from "./Pagination";
import { LEVEL_LABELS, LEVEL_STYLES, DEFAULT_LEVEL_STYLE } from "@/lib/levelConfig";
import TextThumbnail from "./components/TextThumbnail";
import ThumbnailImage from "./components/ThumbnailImage";
import { isManagedThumbnail, getAutoThumbnail } from "@/lib/thumbnails";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 12;

type SortKey  = "createdAt" | "views" | "answers" | "lastAnsweredAt";
type OrderDir = "asc" | "desc";

const VALID_SORTS:  SortKey[]  = ["createdAt", "views", "answers", "lastAnsweredAt"];
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
  searchParams: Promise<{
    category?: string;
    sort?: string;
    order?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const { category, sort: sortParam, order: orderParam, q, page: pageParam } =
    await searchParams;

  const sort: SortKey  = VALID_SORTS.includes(sortParam as SortKey)  ? (sortParam as SortKey)  : "createdAt";
  const order: OrderDir = VALID_ORDERS.includes(orderParam as OrderDir) ? (orderParam as OrderDir) : "desc";
  const searchQuery = q?.trim() ?? "";
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  // ── Prisma where 条件（検索 + カテゴリ + 承認済み） ──────────────
  const where: Prisma.QuestionWhereInput = {
    status: "approved",
    ...(category ? { category } : {}),
    ...(searchQuery
      ? {
          OR: [
            { title:   { contains: searchQuery } },
            { content: { contains: searchQuery } },
          ],
        }
      : {}),
  };

  // ── ページネーション付き質問取得 + 総件数 + AIナビゲーター用全件 ──
  const [questions, totalCount, allQuestions] = await Promise.all([
    prisma.question.findMany({
      where,
      orderBy: buildOrderBy(sort, order),
      skip:  (currentPage - 1) * ITEMS_PER_PAGE,
      take:  ITEMS_PER_PAGE,
      select: {
        id: true, title: true, content: true,
        category: true, level: true, createdAt: true, thumbnail: true,
        _count: { select: { answers: true } },
      },
    }),
    prisma.question.count({ where }),
    // AIナビゲーター用：カテゴリ・検索に関わらず全承認済み質問
    prisma.question.findMany({
      where: { status: "approved" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, content: true,
        category: true, level: true, createdAt: true, thumbnail: true,
        _count: { select: { answers: true } },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // ── URL ビルダー（既存パラメータを保持してページだけ差し替え） ──
  function buildPageHref(page: number): string {
    const params = new URLSearchParams();
    if (category)           params.set("category", category);
    if (sort  !== "createdAt") params.set("sort",  sort);
    if (order !== "desc")   params.set("order", order);
    if (searchQuery)        params.set("q",      searchQuery);
    if (page > 1)           params.set("page",   String(page));
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── ヘッダー ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">質問一覧</h1>
            <p className="text-gray-500 text-sm mt-1">
              トランペット奏者の知見・思考プロセスを蓄積しています
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/fellows" className="text-sm text-teal-600 hover:underline">
              Fellows →
            </Link>
          </div>
        </div>
      </div>

      {/* ── 検索窓 ── */}
      <SearchBox initialValue={searchQuery} />

      {/* ── カテゴリフィルター ── */}
      <CategoryFilter current={category} />

      {/* ── AIチャットナビゲーター ── */}
      <AIChatNavigator questions={allQuestions} />

      {/* ── ソート + 件数 ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400">
          {searchQuery && (
            <span className="mr-1.5">
              「<span className="text-gray-600 font-medium">{searchQuery}</span>」の検索結果 ·
            </span>
          )}
          {totalCount}件
          {totalPages > 1 && (
            <span className="ml-1 text-gray-300">
              （{currentPage}/{totalPages}ページ）
            </span>
          )}
        </p>
        <SortControl currentSort={sort} currentOrder={order} />
      </div>

      {/* ── 質問グリッド ── */}
      {questions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🎺</p>
          {searchQuery ? (
            <>
              <p className="text-lg font-medium">「{searchQuery}」に一致する質問はありません</p>
              <Link href={category ? `/?category=${category}` : "/"} className="inline-block mt-4 text-sm text-teal-600 hover:underline">
                検索をクリア
              </Link>
            </>
          ) : category ? (
            <>
              <p className="text-lg font-medium">「{category}」の質問はまだありません</p>
              <Link href="/" className="inline-block mt-4 text-sm text-teal-600 hover:underline">
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
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {questions.map((q) => {
              const s = LEVEL_STYLES[q.level] ?? DEFAULT_LEVEL_STYLE;
              return (
                <Link
                  key={q.id}
                  href={`/questions/${q.id}`}
                  className={`block bg-white rounded-xl border shadow-sm ${s.cardBorder} ${s.cardHover} transition-all overflow-hidden`}
                >
                  <div className={`h-1 w-full ${s.bar}`} />
                  <ThumbnailImage
                    src={isManagedThumbnail(q.thumbnail) ? q.thumbnail! : getAutoThumbnail(q.id)}
                    title={q.title}
                    category={q.category}
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

          {/* ── ページネーション ── */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            buildHref={buildPageHref}
          />
        </>
      )}
    </div>
  );
}
