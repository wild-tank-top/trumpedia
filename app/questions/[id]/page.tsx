import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Answer } from "@prisma/client";
import { auth } from "@/auth";
import AnswerForm from "./AnswerForm";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [question, session] = await Promise.all([
    prisma.question.findUnique({
      where: { id: Number(id) },
      include: {
        answers: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { name: true, id: true } } },
        },
      },
    }),
    auth(),
  ]);

  if (!question) notFound();

  const isOwner = session?.user.id != null && session?.user.id === question.userId;
  const canEdit = isOwner || session?.user.role === "admin";

  // ログイン中ユーザーの既存回答を検出
  const myExistingAnswer = session?.user.id
    ? question.answers.find((a) => a.userId === session.user.id) ?? null
    : null;

  if (question.status !== "approved" && session?.user.role !== "admin" && !isOwner) {
    notFound();
  }

  return (
    <div>
      {/* パンくず */}
      <div className="text-sm text-gray-400 mb-4 flex items-center justify-between">
        <div>
          <Link href="/" className="hover:text-teal-600">一覧</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600 truncate">{question.title}</span>
        </div>
        {canEdit && (
          <Link
            href={`/questions/${question.id}/edit`}
            className="text-sm text-teal-600 hover:text-teal-700 border border-teal-200 px-3 py-1 rounded-lg transition-colors shrink-0"
          >
            編集
          </Link>
        )}
      </div>

      {/* 承認待ちバナー */}
      {question.status === "pending" && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-lg px-4 py-2 mb-4">
          この質問は現在承認待ちです。管理者が承認すると公開されます。
        </div>
      )}

      {/* 質問カード */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
            {question.category}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {LEVEL_LABELS[question.level] ?? question.level}
          </span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-4">{question.title}</h1>

        <div className="text-sm">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{question.content}</p>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          {new Date(question.createdAt).toLocaleDateString("ja-JP")}
        </p>
      </div>

      {/* 回答一覧 */}
      <h2 className="text-lg font-bold text-gray-800 mb-3">
        回答 ({question.answers.length}件)
      </h2>

      {question.answers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm mb-6">
          <p className="text-2xl mb-2">💬</p>
          <p>まだ回答がありません。最初の回答を投稿しましょう！</p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {question.answers.map((answer: Answer & { user: { name: string | null; id: string } }) => (
            <div key={answer.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {(answer.user.name ?? "?")[0]}
                </div>
                <div>
                  <Link
                    href={`/contributors/${answer.user.id}`}
                    className="font-medium text-sm text-gray-900 hover:text-teal-600"
                  >
                    {answer.user.name ?? "名無し"}
                  </Link>
                  <p className="text-xs text-gray-400">{new Date(answer.createdAt).toLocaleDateString("ja-JP")}</p>
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

      {/* 回答フォーム */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-base font-bold text-gray-800 mb-4">
          {myExistingAnswer ? "回答を編集する" : "回答を投稿する"}
        </h3>
        <AnswerForm questionId={question.id} session={session} existingAnswer={myExistingAnswer} />
      </div>
    </div>
  );
}


function AnswerSection({ label, children, highlight }: { label: string; children: string; highlight?: boolean }) {
  return (
    <div className={highlight ? "bg-teal-50 border border-teal-100 rounded-lg p-3" : ""}>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`whitespace-pre-wrap leading-relaxed ${highlight ? "text-teal-900 font-medium" : "text-gray-700"}`}>{children}</p>
    </div>
  );
}
