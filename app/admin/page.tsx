import { prisma } from "@/lib/prisma";
import AdminQuestions from "./AdminQuestions";
import AdminUsers from "./AdminUsers";

export default async function AdminPage() {
  const [allQuestions, users] = await Promise.all([
    // 全ステータスの質問を取得（AdminQuestionsでクライアント側フィルター）
    prisma.question.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { answers: true } },
      },
    }),
  ]);

  const pendingCount = allQuestions.filter((q) => q.status === "pending").length;

  return (
    <div className="space-y-10">
      {/* 質問管理セクション */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-800">質問管理</h2>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            全{allQuestions.length}件
          </span>
          {pendingCount > 0 && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
              承認待ち {pendingCount}件
            </span>
          )}
        </div>
        <AdminQuestions questions={allQuestions} />
      </section>

      {/* ユーザー管理セクション */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-800">ユーザー管理</h2>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {users.length}人
          </span>
        </div>
        <AdminUsers users={users} />
      </section>
    </div>
  );
}
