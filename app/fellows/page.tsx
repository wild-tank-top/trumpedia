import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import FellowFilter from "./FellowFilter";

export const metadata: Metadata = {
  title: "Fellows | Trumpedia",
};

export const dynamic = "force-dynamic";

export default async function FellowsPage() {
  const fellows = await prisma.user.findMany({
    where: { role: "fellow" },
    select: {
      id: true,
      name: true,
      image: true,
      profile: { select: { bio: true, career: true, yomi: true } },
      _count: { select: { answers: true } },
    },
  });

  // yomi をトップレベルに展開（FellowFilter が使いやすい形に）
  const fellowsWithYomi = fellows.map((f) => ({
    ...f,
    yomi: f.profile?.yomi ?? "",
  }));

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
        <FellowFilter fellows={fellowsWithYomi} />
      )}
    </div>
  );
}
