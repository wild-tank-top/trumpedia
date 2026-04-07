import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import AdminQuestions from "./AdminQuestions";
import AdminUsers from "./AdminUsers";
import AdminFellowApplications from "./AdminFellowApplications";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [session, allQuestions, users, fellowApplications] = await Promise.all([
    auth(),
    prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, content: true,
        category: true, level: true, status: true, createdAt: true,
      },
    }),
    // メールアドレスは取得しない
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, role: true, createdAt: true,
        _count: { select: { answers: true } },
      },
    }),
    prisma.fellowApplication.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        applicant: { select: { id: true, name: true, createdAt: true } },
        referrer:  { select: { id: true, name: true } },
      },
    }).catch(() => []),
  ]);

  const pendingCount = allQuestions.filter((q) => q.status === "pending").length;
  const awaitingAdmin = fellowApplications.filter((a) => a.status === "referrer_approved").length;

  // 日付シリアライズ
  const serializedApplications = fellowApplications.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    applicant: { ...a.applicant, createdAt: a.applicant.createdAt.toISOString() },
  }));

  return (
    <div className="space-y-10">
      {/* Fellows合流待機リスト */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-800">Fellows合流待機リスト</h2>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {serializedApplications.length}件
          </span>
          {awaitingAdmin > 0 && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
              最終確認待ち {awaitingAdmin}件
            </span>
          )}
        </div>
        <AdminFellowApplications applications={serializedApplications} />
      </section>

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
        <AdminUsers users={users} currentUserRole={session?.user.role ?? "admin"} />
      </section>
    </div>
  );
}
