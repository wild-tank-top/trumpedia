import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Answer } from "@prisma/client";
import { auth } from "@/auth";
import AnswerForm from "./AnswerForm";
import LikeButton from "./LikeButton";
import DeleteAnswerButton from "./DeleteAnswerButton";
import DeleteQuestionButton from "./DeleteQuestionButton";
import SupplementForm from "./SupplementForm";
import NotificationReader from "./NotificationReader";
import ViewTracker from "./ViewTracker";
import Avatar from "@/app/components/Avatar";
import { LEVEL_LABELS, LEVEL_STYLES, DEFAULT_LEVEL_STYLE } from "@/lib/levelConfig";
import TextThumbnail from "@/app/components/TextThumbnail";
import ThumbnailImage from "@/app/components/ThumbnailImage";
import { isManagedThumbnail, getAutoThumbnail } from "@/lib/thumbnails";
import { getRelatedQuestions } from "@/lib/relatedQuestions";
import { isAdmin as isAdminRole, isFellow as isFellowRole } from "@/lib/roles";

type AnswerWithMeta = Answer & {
  user: { name: string | null; id: string; image: string | null };
  _count: { likes: number };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const question = await prisma.question.findUnique({
    where: { id: Number(id) },
    select: { title: true, content: true, level: true, thumbnail: true },
  });
  if (!question) return { title: "質問が見つかりません" };

  const description = question.content.slice(0, 150);
  const effectiveThumbnail = isManagedThumbnail(question.thumbnail)
    ? question.thumbnail!
    : getAutoThumbnail(Number(id));
  const ogImage = `/api/og?title=${encodeURIComponent(question.title)}&level=${question.level}&thumbnail=${encodeURIComponent(effectiveThumbnail)}`;

  return {
    title: question.title,
    description,
    openGraph: {
      title: question.title,
      description,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: question.title,
      description,
      images: [ogImage],
    },
  };
}


export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth().catch((err) => {
    console.error("[QuestionDetail] auth() error:", err);
    return null;
  });

  let question;
  try {
    question = await prisma.question.findUnique({
      where: { id: Number(id) },
      include: {
        answers: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { name: true, id: true, image: true } },
            _count: { select: { likes: true } },
          },
        },
      },
    });
  } catch (err) {
    console.error("[QuestionDetail] DB error:", err);
    notFound();
  }

  if (!question) notFound();

  // QuestionSupplement テーブルが未作成の場合も空配列で継続（404 を防ぐ）
  const supplements = await prisma.questionSupplement
    .findMany({
      where: { questionId: Number(id) },
      orderBy: { createdAt: "asc" },
    })
    .catch(() => []);

  const isOwner = session?.user.id != null && session?.user.id === question.userId;
  const canEdit = isOwner || isAdminRole(session?.user.role);
  const isLocked = question.answers.length > 0; // 回答があると質問本文は編集不可
  const ls = LEVEL_STYLES[question.level] ?? DEFAULT_LEVEL_STYLE;
  const isFellow = isFellowRole(session?.user.role) || isAdminRole(session?.user.role);

  // ログイン中ユーザーの既存回答を検出
  const myExistingAnswer = session?.user.id
    ? question.answers.find((a) => a.userId === session.user.id) ?? null
    : null;

  // ログイン中ユーザーがいいねしている回答IDセット
  const myLikedAnswerIds = session?.user.id
    ? await prisma.like.findMany({
        where: {
          userId: session.user.id,
          answerId: { in: question.answers.map((a) => a.id) },
        },
        select: { answerId: true },
      })
        .then((likes) => new Set(likes.map((l) => l.answerId)))
        .catch(() => new Set<number>())
    : new Set<number>();

  if (question.status !== "approved" && !isAdminRole(session?.user.role) && !isOwner) {
    notFound();
  }

  // 関連質問の取得・スコアリング
  const relatedCandidates = await prisma.question.findMany({
    where: { status: "approved", id: { not: question.id } },
    select: {
      id: true, title: true, content: true,
      category: true, level: true, views: true, thumbnail: true,
      _count: { select: { answers: true } },
    },
  }).catch(() => []);

  const relatedQuestions = getRelatedQuestions(
    { id: question.id, title: question.title, content: question.content, category: question.category, level: question.level },
    relatedCandidates,
    4
  );

  return (
    <div>
      {/* パンくず */}
      <div className="text-sm text-gray-400 mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0 overflow-hidden flex items-center">
          <Link href="/" className="hover:text-teal-600 shrink-0">一覧</Link>
          <span className="mx-2 shrink-0">/</span>
          <span className="text-gray-600 truncate">{question.title}</span>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2 shrink-0">
            {isLocked ? (
              <span
                title="回答があるため編集できません"
                className="text-xs text-gray-400 border border-gray-200 px-3 py-1 rounded-lg cursor-not-allowed select-none"
              >
                編集不可
              </span>
            ) : (
              <Link
                href={`/questions/${question.id}/edit`}
                className="text-sm text-teal-600 hover:text-teal-700 border border-teal-200 px-3 py-1 rounded-lg transition-colors"
              >
                編集
              </Link>
            )}
            <DeleteQuestionButton questionId={question.id} />
          </div>
        )}
      </div>

      {/* 承認待ちバナー */}
      {question.status === "pending" && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-lg px-4 py-2 mb-4">
          この質問は現在承認待ちです。管理者が承認すると公開されます。
        </div>
      )}

      {/* 閲覧カウント（マウント時1回だけAPIコール） */}
      <ViewTracker questionId={question.id} />

      {/* 質問カード（難易度に応じた背景・枠線） */}
      <div className={`rounded-xl border p-5 mb-6 overflow-hidden ${ls.detailBg} ${ls.detailBorder}`}>
        {/* 難易度カラーバー */}
        <div className={`-mx-5 -mt-5 mb-4 h-1 ${ls.bar}`} />

        {/* サムネイル */}
        <ThumbnailImage
          src={isManagedThumbnail(question.thumbnail) ? question.thumbnail! : getAutoThumbnail(question.id)}
          title={question.title}
          category={question.category}
          className="rounded-lg mb-4"
        />
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs bg-white/70 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full">
            {question.category}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${ls.badge}`}>
            {LEVEL_LABELS[question.level] ?? question.level}
          </span>
        </div>
        <h1 className={`text-xl font-bold mb-4 ${ls.detailTitle}`}>{question.title}</h1>

        <div className="text-sm">
          <p className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed">{question.content}</p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-400">
            {new Date(question.createdAt).toLocaleDateString("ja-JP")}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{question.views.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 補足一覧 */}
      {supplements.length > 0 && (
        <div className="space-y-2 mb-6">
          {supplements.map((s) => (
            <div key={s.id} className="bg-teal-50 border-l-4 border-teal-400 rounded-r-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">補足</span>
                <span className="text-xs text-gray-400">
                  {new Date(s.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* 補足フォーム（質問者のみ） */}
      {isOwner && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-2">
            回答後に追加情報がある場合は補足として投稿できます（回答者全員に通知されます）
          </p>
          <SupplementForm questionId={question.id} />
        </div>
      )}

      {/* 通知既読化（回答者がページを開いたら自動で既読） */}
      {session && <NotificationReader questionId={question.id} />}

      {/* 回答一覧 */}
      <h2 className="text-lg font-bold text-gray-800 mb-3">
        回答 ({question.answers.length}件)
      </h2>

      {question.answers.length === 0 ? (
        isFellow ? (
          /* fellow / admin: 投稿を促すメッセージ */
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm mb-6">
            <p className="text-2xl mb-2">💬</p>
            <p>まだ回答がありません。最初の回答を投稿しましょう！</p>
          </div>
        ) : (
          /* ゲスト / 未ログイン: 静かな表示のみ */
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm mb-6">
            <p className="text-2xl mb-2">💬</p>
            <p>まだ回答がありません</p>
          </div>
        )
      ) : (
        <div className="space-y-4 mb-8">
          {question.answers.map((answer: AnswerWithMeta) => (
            <div key={answer.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar src={answer.user.image} name={answer.user.name} size="sm" />
                  <div className="min-w-0">
                    <Link
                      href={`/contributors/${answer.user.id}`}
                      className="font-medium text-sm text-gray-900 hover:text-teal-600 truncate block"
                    >
                      {answer.user.name ?? "名無し"}
                    </Link>
                    <p className="text-xs text-gray-400">{new Date(answer.createdAt).toLocaleDateString("ja-JP")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <LikeButton
                    answerId={answer.id}
                    initialCount={answer._count.likes}
                    initialLiked={myLikedAnswerIds.has(answer.id)}
                    isLoggedIn={!!session}
                  />
                  {(session?.user.id === answer.userId || isAdminRole(session?.user.role)) && (
                    <DeleteAnswerButton answerId={answer.id} />
                  )}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <AnswerSection label="要約" highlight>{answer.summary}</AnswerSection>
                <AnswerSection label="原因分析">{answer.causeAnalysis}</AnswerSection>
                <AnswerSection label="思考プロセス">{answer.thinking}</AnswerSection>
                <AnswerSection label="アプローチ">{answer.approach}</AnswerSection>
                {answer.ngExamples && <AnswerSection label="NGな例">{answer.ngExamples}</AnswerSection>}
                {answer.exceptions && <AnswerSection label="例外・注意点">{answer.exceptions}</AnswerSection>}
                {answer.philosophy && <AnswerSection label="価値観・哲学">{answer.philosophy}</AnswerSection>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 回答フォーム: Fellow/Admin のみ表示 */}
      {session && isFellow && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-bold text-gray-800 mb-4">
            {myExistingAnswer ? "回答を編集する" : "回答を投稿する"}
          </h3>
          {/* key を answer ID で固定することで削除後に状態をリセット */}
          <AnswerForm
            key={myExistingAnswer?.id ?? "new"}
            questionId={question.id}
            session={session}
            existingAnswer={myExistingAnswer}
          />
        </div>
      )}

      {/* 関連質問 */}
      {relatedQuestions.length > 0 && (
        <div className="mt-10 pt-8 border-t border-gray-200">
          <h2 className="text-base font-bold text-gray-800 mb-4">関連する質問</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedQuestions.map((q) => {
              const s = LEVEL_STYLES[q.level] ?? DEFAULT_LEVEL_STYLE;
              const src = isManagedThumbnail(q.thumbnail)
                ? q.thumbnail!
                : getAutoThumbnail(q.id);
              return (
                <Link
                  key={q.id}
                  href={`/questions/${q.id}`}
                  className={`flex gap-3 bg-white rounded-xl border ${s.cardBorder} p-3 hover:shadow-md transition-all group`}
                >
                  {/* サムネイル */}
                  <div className="w-24 shrink-0 rounded-lg overflow-hidden aspect-video self-start">
                    <ThumbnailImage src={src} title={q.title} />
                  </div>
                  {/* テキスト */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 mb-1">
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                        {q.category}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${s.badge}`}>
                        {LEVEL_LABELS[q.level] ?? q.level}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-teal-700 transition-colors">
                      {q.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">回答 {q._count.answers}件</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


function AnswerSection({ label, children, highlight }: { label: string; children: string; highlight?: boolean }) {
  return (
    <div className={highlight ? "bg-teal-50 border border-teal-100 rounded-lg p-3" : ""}>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`whitespace-pre-wrap break-words leading-relaxed ${highlight ? "text-teal-900 font-medium" : "text-gray-700"}`}>{children}</p>
    </div>
  );
}
