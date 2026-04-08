import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Lock } from "lucide-react";
import EditQuestionForm from "./EditQuestionForm";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, question] = await Promise.all([
    auth(),
    prisma.question.findUnique({
      where: { id: Number(id) },
      include: { _count: { select: { answers: true } } },
    }),
  ]);

  if (!question) notFound();
  if (!session) redirect("/login");

  if (session.user.id !== question.userId && !isAdmin(session.user.role)) {
    notFound();
  }

  // 回答がある場合は編集不可
  if (question._count.answers > 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">質問を編集する</h1>
          <Link href={`/questions/${question.id}`} className="text-sm text-gray-400 hover:text-gray-600">
            ← 戻る
          </Link>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
          <Lock size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 mb-1">回答があるため編集できません</p>
            <p className="text-sm text-amber-700">
              この質問には {question._count.answers} 件の回答があります。
              Q&Aの整合性を保つため、回答後の質問タイトル・内容の編集は制限されています。
            </p>
            <p className="text-sm text-amber-600 mt-2">
              追加情報がある場合は、質問ページの「補足を追加する」をご利用ください。
            </p>
            <Link
              href={`/questions/${question.id}`}
              className="inline-block mt-3 text-sm bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              質問ページに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <EditQuestionForm question={question} />
    </div>
  );
}
