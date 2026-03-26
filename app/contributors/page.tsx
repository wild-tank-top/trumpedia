import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: "管理者", color: "bg-red-100 text-red-700" },
  pro:   { label: "Pro",    color: "bg-amber-100 text-amber-700" },
};

export default async function ContributorsPage() {
  // 1件以上回答したユーザーを name 昇順（50音順）で取得
  const contributors = await prisma.user.findMany({
    where: {
      answers: { some: {} },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
      profile: { select: { bio: true } },
      _count: { select: { answers: true } },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">回答者一覧</h1>
        <p className="text-gray-500 text-sm mt-1">
          Trumpediaに知見を提供しているプロ奏者たち
        </p>
      </div>

      {contributors.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🎺</p>
          <p className="text-lg font-medium">まだ回答者がいません</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {contributors.map((user) => {
            const badge = ROLE_LABELS[user.role];
            return (
              <Link
                key={user.id}
                href={`/contributors/${user.id}`}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-amber-300 hover:shadow-sm transition-all flex items-center gap-4"
              >
                {/* アバター */}
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name ?? ""}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-bold shrink-0">
                    {(user.name ?? "?")[0]}
                  </div>
                )}

                {/* 情報 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 truncate">
                      {user.name ?? "名無し"}
                    </span>
                    {badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    )}
                  </div>
                  {user.profile?.bio && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{user.profile.bio}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    回答 {user._count.answers}件
                  </p>
                </div>

                <span className="text-gray-300 shrink-0">›</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
