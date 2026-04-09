import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import FellowFilter from "./FellowFilter";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "Fellows（回答者一覧）",
  description:
    "Trumpediaに在籍するプロトランペット奏者・Fellows の一覧。演奏歴・経歴・専門分野を確認して、あなたの悩みに最適な奏者を探せます。",
  alternates: { canonical: `${SITE_URL}/fellows` },
  openGraph: {
    title: "Fellows（回答者一覧） | Trumpedia",
    description: "Trumpediaに在籍するプロトランペット奏者・Fellows の一覧。",
    url: `${SITE_URL}/fellows`,
    type: "website",
    locale: "ja_JP",
    siteName: "Trumpedia",
  },
};

export const dynamic = "force-dynamic"; // Tier preview requires per-request cookie

export default async function FellowsPage() {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isMasterAdmin = session?.user.role === "master_admin";
  const tierPreviewRaw = cookieStore.get("tier_preview")?.value;
  const adminPreviewCount =
    isMasterAdmin && tierPreviewRaw !== undefined ? parseInt(tierPreviewRaw, 10) : null;

  const fellows = await prisma.user.findMany({
    where: { role: { in: ["fellow", "admin_fellow"] } },
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
        <FellowFilter
        fellows={fellowsWithYomi}
        adminId={isMasterAdmin ? session?.user.id : undefined}
        adminPreviewCount={adminPreviewCount}
      />
      )}
    </div>
  );
}
