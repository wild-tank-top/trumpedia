import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import Avatar from "@/app/components/Avatar";
import { getTier } from "@/lib/answerTier";
import TierCornerOrnament from "@/app/components/TierCornerOrnament";
import { isAdmin as isAdminRole, isMasterAdmin as isMasterAdminRole, ROLE_LABELS } from "@/lib/roles";

export default async function ContributorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [user, session] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        profile: true,
        answers: {
          orderBy: { createdAt: "desc" },
          include: {
            question: {
              select: { id: true, title: true, category: true, status: true },
            },
          },
        },
      },
    }),
    auth(),
  ]);

  if (!user) notFound();

  const isOwnProfile = session?.user.id === id;
  const isAdmin = isAdminRole(session?.user.role);
  const isMasterAdmin = isMasterAdminRole(session?.user.role);
  const badge = ROLE_LABELS[user.role] ?? ROLE_LABELS.guest;

  // マスター管理者が自分のプロフィールを見る場合はTierプレビューを反映
  const cookieStore = await cookies();
  const tierPreviewRaw = cookieStore.get("tier_preview")?.value;
  const answerCountForTier =
    isMasterAdmin && isOwnProfile && tierPreviewRaw !== undefined
      ? parseInt(tierPreviewRaw, 10)
      : user.answers.length;
  const tier = getTier(answerCountForTier);

  // 公開されている回答のみ表示（自分 or admin は全件）
  const visibleAnswers =
    isOwnProfile || isAdmin
      ? user.answers
      : user.answers.filter((a) => a.question.status === "approved");

  return (
    <div>
      {/* プロフィールヘッダー */}
      <div className={`p-6 mb-6 transition-all ${tier.shape} ${tier.bg} ${tier.border} ${tier.glow}`}>
        <TierCornerOrnament level={tier.ornamentLevel} colorClass={tier.ornamentColor} size={42} />
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar src={user.image} name={user.name} size="lg" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{user.name ?? "名無し"}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-0.5">
                {new Date(user.createdAt).toLocaleDateString("ja-JP")} 登録
              </p>
            </div>
          </div>

          {(isOwnProfile || isAdmin) && (
            <Link
              href={`/contributors/${id}/edit`}
              className="text-sm border border-gray-300 text-gray-600 px-4 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
            >
              編集
            </Link>
          )}
        </div>

        {/* バイオ・経歴 */}
        {user.profile?.bio && (
          <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">{user.profile.bio}</p>
        )}
        {user.profile?.career && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">経歴</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{user.profile.career}</p>
          </div>
        )}

        {/* SNSリンク */}
        <div className="flex flex-wrap gap-3 mt-4">
          {user.profile?.twitter && (
            <a
              href={`https://twitter.com/${user.profile.twitter.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              𝕏 {user.profile.twitter}
            </a>
          )}
          {user.profile?.youtube && (
            <a
              href={user.profile.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-red-500 hover:underline"
            >
              ▶ YouTube
            </a>
          )}
          {user.profile?.instagram && (
            <a
              href={`https://instagram.com/${user.profile.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-pink-500 hover:underline"
            >
              ◎ {user.profile.instagram}
            </a>
          )}
          {user.profile?.website && (
            <a
              href={user.profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:underline"
            >
              🌐 Website
            </a>
          )}
        </div>
      </div>

      {/* 回答一覧 */}
      <h2 className="text-lg font-bold text-gray-800 mb-3">
        回答一覧（{visibleAnswers.length}件）
      </h2>

      {visibleAnswers.length === 0 ? (
        <p className="text-gray-400 text-sm">まだ回答はありません。</p>
      ) : (
        <div className="space-y-3">
          {visibleAnswers.map((answer) => {
            const isApproved = answer.question.status === "approved";
            // approved質問のみリンク有効。rejected/pendingはカード表示のみ（404防止）
            const CardContent = (
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                      {answer.question.category}
                    </span>
                    {!isApproved && (isOwnProfile || isAdmin) && (
                      <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-0.5 rounded-full">
                        {answer.question.status === "rejected" ? "却下" : "承認待ち"}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 mt-2 truncate">{answer.question.title}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{answer.summary}</p>
                </div>
                <p className="text-xs text-gray-400 shrink-0">
                  {new Date(answer.createdAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
            );

            return isApproved ? (
              <Link
                key={answer.id}
                href={`/questions/${answer.questionId}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-amber-300 hover:shadow-sm transition-all"
              >
                {CardContent}
              </Link>
            ) : (
              <div
                key={answer.id}
                className="block bg-white rounded-xl border border-gray-100 p-4 opacity-60"
              >
                {CardContent}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
