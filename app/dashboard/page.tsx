import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import InviteCodeManager from "./InviteCodeManager";
import MissionMessage from "./MissionMessage";
import PendingReferrals from "./PendingReferrals";
import ResonanceGraph from "./ResonanceGraph";
import WeeklyFocusTag from "./WeeklyFocusTag";
import AnswerTierCard from "./AnswerTierCard";
import NotificationToast from "./NotificationToast";
import TierPreviewSelector from "./TierPreviewSelector";
import TierRoadmap from "./TierRoadmap";
import { isAdmin as isAdminRole, isMasterAdmin as isMasterAdminRole } from "@/lib/roles";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const role   = session.user.role;
  const userId = session.user.id;
  const isAdmin = isAdminRole(role);
  const isMasterAdmin = isMasterAdminRole(role);

  // 管理者向けTierプレビュー（Cookie）
  const cookieStore = await cookies();
  const tierPreviewRaw = cookieStore.get("tier_preview")?.value;
  const tierPreviewCount = isMasterAdmin && tierPreviewRaw !== undefined
    ? parseInt(tierPreviewRaw, 10)
    : null;

  // ── ゲスト: プロフィールページへリダイレクト ──────────────────
  if (role === "guest") {
    redirect(`/contributors/${userId}`);
  }

  // ── Fellow / Admin: フルダッシュボード ──────────────────────────
  // 7日前の00:00
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalAnswers,
    answeredQuestions,
    unansweredCount,
    inviteCodes,
    pendingReferrals,
    categoryQuestions,
    rawPageViews,
  ] = await Promise.all([
    prisma.answer.count({ where: { userId } }),
    prisma.question.findMany({
      where: { answers: { some: { userId } } },
      select: { views: true },
    }),
    prisma.question.count({
      where: { status: "approved", answers: { none: {} } },
    }),
    prisma.inviteCode.findMany({
      where: { issuerId: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        usedBy: { select: { name: true, email: true } },
        application: { select: { status: true } },
      },
    }).catch(() => []),
    prisma.fellowApplication.findMany({
      where: { referrerId: userId, status: "pending" },
      include: {
        applicant: { select: { name: true, email: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    // Weekly Focus: カテゴリ別の回答状況
    prisma.question.findMany({
      where: { status: "approved" },
      select: { category: true, _count: { select: { answers: true } } },
    }).catch(() => []),
    // Resonance Graph: 直近7日のPV（テーブル未作成時は空配列で続行）
    (prisma.pageView as typeof prisma.pageView | undefined)
      ?.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { createdAt: true } })
      .catch(() => []) ?? Promise.resolve([]),
  ]);

  // ── Resonance Graph: 日別集計（1クエリから計算） ────────────────
  const dayCountMap = new Map<string, number>();
  for (const pv of rawPageViews) {
    const key = pv.createdAt.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
    dayCountMap.set(key, (dayCountMap.get(key) ?? 0) + 1);
  }
  const sevenDayStats = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
    return { date: key, count: dayCountMap.get(key) ?? 0 };
  });

  // ── Weekly Focus: 最も未回答率が高いカテゴリを抽出 ─────────────
  type CatStat = { total: number; unanswered: number; totalAnswers: number };
  const catMap: Record<string, CatStat> = {};
  for (const q of categoryQuestions) {
    if (!catMap[q.category]) catMap[q.category] = { total: 0, unanswered: 0, totalAnswers: 0 };
    catMap[q.category].total++;
    catMap[q.category].totalAnswers += q._count.answers;
    if (q._count.answers === 0) catMap[q.category].unanswered++;
  }
  const weeklyFocus = Object.entries(catMap)
    .filter(([, s]) => s.total >= 2)
    .map(([category, s]) => {
      const unansweredRatio = s.unanswered / s.total;
      const avgAnswers = s.totalAnswers / s.total;
      const score = unansweredRatio * 0.65 + (1 / (avgAnswers + 1)) * 0.35;
      return { category, score, unanswered: s.unanswered, total: s.total };
    })
    .sort((a, b) => b.score - a.score)[0] ?? null;

  const totalViews    = answeredQuestions.reduce((s, q) => s + q.views, 0);
  // 日付シリアライズ
  const serializedCodes = inviteCodes.map((c) => ({
    ...c,
    expiresAt: c.expiresAt.toISOString(),
    usedAt:    c.usedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  }));
  const serializedReferrals = pendingReferrals.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    applicant: { ...a.applicant, createdAt: a.applicant.createdAt.toISOString() },
  }));

  return (
    <div className="space-y-8">
      {/* トースト通知 */}
      <NotificationToast />

      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {session.user.name ?? "Fellow"} さんの貢献サマリー
        </p>
      </div>

      {/* 承認待ち申請（あれば最上部に） */}
      <PendingReferrals applications={serializedReferrals} />

      {/* Weekly Focus */}
      <WeeklyFocusTag focus={weeklyFocus} />

      {/* Global Resonance Graph */}
      <ResonanceGraph stats={sevenDayStats} />

      {/* Answer Tier + 統計ウィジェット */}
      <AnswerTierCard totalAnswers={tierPreviewCount ?? totalAnswers} />
      {isMasterAdmin && (
        <TierPreviewSelector current={tierPreviewCount ?? totalAnswers} />
      )}

      {/* 統計ウィジェット */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="合計回答数" value={totalAnswers} unit="件" color="teal"
          description="これまでに投稿した回答の総数" />
        <StatCard label="合計被閲覧数" value={totalViews} unit="回" color="blue"
          description="あなたが回答した質問の総閲覧数" />
        <StatCard label="未回答の質問" value={unansweredCount} unit="件" color="amber"
          description="まだ誰も回答していない承認済み質問"
          href="/?sort=createdAt&order=desc" hrefLabel="質問を見る" />
      </div>

      {/* Tier Roadmap */}
      <TierRoadmap totalAnswers={tierPreviewCount ?? totalAnswers} />

      {/* AI クローンプロジェクト ティーザー */}
      {(() => {
        const count   = tierPreviewCount ?? totalAnswers;
        const reached = count >= 100;
        const remaining = Math.max(0, 100 - count);
        return (
          <div className={`rounded-2xl border px-5 py-4 flex items-start gap-4 transition-all ${
            reached
              ? "border-yellow-400 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 shadow-md shadow-yellow-200"
              : "border-gray-200 bg-gray-50/60"
          }`}>
            {/* アイコン */}
            <div className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center mt-0.5 ${
              reached
                ? "bg-amber-100 border-amber-300"
                : "bg-gray-100 border-gray-200"
            }`}>
              <svg className={`w-5 h-5 ${reached ? "text-amber-600" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.575 1.57a1.5 1.5 0 01-2.122 0l-2.122-2.12a1.5 1.5 0 00-2.122 0l-2.12 2.12a1.5 1.5 0 01-2.123 0L6.2 15m13.6 0l1.5 1.5a1.5 1.5 0 010 2.12l-1.5 1.5" />
              </svg>
            </div>

            {/* テキスト */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className={`text-sm font-bold ${reached ? "text-amber-900" : "text-gray-500"}`}>
                  AI クローンプロジェクト
                </p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border tracking-wide ${
                  reached
                    ? "bg-amber-200 text-amber-800 border-amber-300"
                    : "bg-gray-100 text-gray-400 border-gray-200"
                }`}>
                  構想中
                </span>
                {reached && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 border border-teal-200">
                    参加資格あり
                  </span>
                )}
              </div>

              {reached ? (
                <p className="text-xs text-amber-900 leading-relaxed">
                  あなたの蓄積された思考・演奏哲学を学習し、24時間365日あなたに代わって悩みを受け止める
                  <span className="font-semibold">「パーソナル AI 分身」</span>
                  作成プロジェクトへの参加資格を獲得しました。詳細は管理者までお問い合わせください。
                </p>
              ) : (
                <p className="text-xs text-gray-500 leading-relaxed">
                  100件の回答を達成した Fellows のみ参加できる特別プロジェクト。
                  蓄積した思考・演奏哲学を学習した AI 分身を一緒に作ります。
                  <span className="font-medium text-gray-600 ml-1">あと {remaining} 件で解放。</span>
                </p>
              )}
            </div>
          </div>
        );
      })()}

      {/* 未回答CTA */}
      {unansweredCount > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal-800">
              {unansweredCount}件の質問があなたの回答を待っています
            </p>
            <p className="text-xs text-teal-600 mt-0.5">あなたの知識でコミュニティに貢献しましょう</p>
          </div>
          <Link href="/?sort=createdAt&order=desc"
            className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors">
            質問を見る
          </Link>
        </div>
      )}

      {/* 招待コード管理 */}
      <InviteCodeManager initialCodes={serializedCodes} />

      {/* ミッション＆ベネフィット */}
      <MissionMessage />
    </div>
  );
}

function StatCard({
  label, value, unit, color, description, href, hrefLabel,
}: {
  label: string; value: number; unit: string;
  color: "teal" | "blue" | "amber"; description: string;
  href?: string; hrefLabel?: string;
}) {
  const colorMap = {
    teal:  { bg: "bg-teal-50",  border: "border-teal-200",  value: "text-teal-700",  link: "text-teal-600 hover:text-teal-800" },
    blue:  { bg: "bg-blue-50",  border: "border-blue-200",  value: "text-blue-700",  link: "text-blue-600 hover:text-blue-800" },
    amber: { bg: "bg-amber-50", border: "border-amber-200", value: "text-amber-700", link: "text-amber-600 hover:text-amber-800" },
  };
  const c = colorMap[color];
  return (
    <div className={`${c.bg} ${c.border} border rounded-2xl p-5`}>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${c.value}`}>
        {value.toLocaleString()}<span className="text-sm font-normal ml-1">{unit}</span>
      </p>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
      {href && hrefLabel && (
        <Link href={href} className={`text-xs font-medium mt-2 inline-block ${c.link}`}>
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}
