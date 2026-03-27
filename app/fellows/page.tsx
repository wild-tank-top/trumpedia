import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Avatar from "@/app/components/Avatar";

export const metadata: Metadata = {
  title: "Fellows | Trumpedia",
};

export const dynamic = "force-dynamic";

export default async function FellowsPage() {
  // role = "fellow" のみを名前昇順で取得（admin・guest は含めない）
  const fellows = await prisma.user.findMany({
    where: { role: "fellow" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      profile: { select: { bio: true, career: true } },
      _count: { select: { answers: true } },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fellows</h1>
        <p className="text-gray-500 text-sm mt-1">
          Trumpediaの認定Fellowメンバー（{fellows.length}名）
        </p>
      </div>

      {fellows.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🎺</p>
          <p className="text-lg font-medium">まだFellowメンバーがいません</p>
          <p className="text-sm mt-1">管理者がFellowロールを付与すると表示されます</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fellows.map((fellow) => (
            <Link
              key={fellow.id}
              href={`/contributors/${fellow.id}`}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-amber-300 hover:shadow-sm transition-all flex items-center gap-4"
            >
              <Avatar src={fellow.image} name={fellow.name} size="md" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 truncate">
                    {fellow.name ?? "名無し"}
                  </span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    Fellow
                  </span>
                </div>
                {fellow.profile?.bio && (
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{fellow.profile.bio}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  回答 {fellow._count.answers}件
                </p>
              </div>

              <span className="text-gray-300 shrink-0">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
