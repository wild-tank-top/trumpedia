import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import InviteCodeManager from "./InviteCodeManager";
import MissionMessage from "./MissionMessage";
import PendingReferrals from "./PendingReferrals";
import GuestDashboard from "./GuestDashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const role   = session.user.role;
  const userId = session.user.id;

  // ── ゲスト: 申請状況のみ表示 ──────────────────────────────────
  if (role === "guest") {
    const application = await prisma.fellowApplication
      .findUnique({
        where: { applicantId: userId },
        select: {
          id: true, status: true, createdAt: true,
          referrer: { select: { name: true } },
        },
      })
      .catch(() => null);

    // admin_completed のまま guest に戻されたユーザーは再申請できるよう null 扱い
    const serialized =
      application && application.status !== "admin_completed"
        ? { ...application, createdAt: application.createdAt.toISOString() }
        : null;

    return (
      <div className="space-y-6 max-w-xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">マイページ</h1>
          <p className="text-sm text-gray-500 mt-1">
            {session.user.name ?? "ゲスト"} さん
          </p>
        </div>
        <GuestDashboard application={serialized} />
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-sm text-gray-500 space-y-1">
          <p className="font-medium text-gray-700">ゲストでできること</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li>質問の投稿・閲覧</li>
            <li>自分の質問の管理</li>
          </ul>
          <p className="font-medium text-gray-700 pt-2">Fellows になるとできること</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li>質問への回答・いいね</li>
            <li>AIクローン進捗の追跡</li>
            <li>他のユーザーへの招待コードの発行</li>
          </ul>
        </div>
      </div>
    );
  }

  // ── Fellow / Admin: フルダッシュボード ──────────────────────────
  const [
    totalAnswers,
    answeredQuestions,
    unansweredCount,
    inviteCodes,
    pendingReferrals,
  ] = await Promise.all([
    prisma.answer.count({ where: { userId } }),
    prisma.question.findMany({
      where: { answers: { some: { userId } } },
      select: { views: true },
    }),
    prisma.question.count({
      where: { status: "approved", answers: { none: {} } },
    }),
    // 自分が発行したコード（直近20件）
    prisma.inviteCode.findMany({
      where: { issuerId: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        usedBy: { select: { name: true, email: true } },
        application: { select: { status: true } },
      },
    }).catch(() => []),
    // 自分が紹介者で承認待ちの申請
    prisma.fellowApplication.findMany({
      where: { referrerId: userId, status: "pending" },
      include: {
        applicant: { select: { name: true, email: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
  ]);

  const totalViews    = answeredQuestions.reduce((s, q) => s + q.views, 0);
  const cloneProgress = Math.min(totalAnswers, 100);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {session.user.name ?? "Fellow"} さんの貢献サマリー
        </p>
      </div>

      {/* 承認待ち申請（あれば最上部に） */}
      <PendingReferrals applications={serializedReferrals} />

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

      {/* AIクローン進捗 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">AIクローン進捗</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              100件の回答であなたのAIクローンbot作成プロジェクトにご招待します
            </p>
          </div>
          <span className="text-2xl font-bold text-amber-600 shrink-0 ml-4">
            {cloneProgress}
            <span className="text-sm font-normal text-gray-400"> / 100</span>
          </span>
        </div>
        <div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${cloneProgress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span>0件</span><span>100件</span>
          </div>
        </div>
        {totalAnswers >= 100 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
            <p className="text-amber-800 font-semibold text-sm">
              🎉 招待条件を達成しました！管理者までご連絡ください。
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center">
            あと <span className="font-semibold text-amber-600">{100 - totalAnswers}</span> 件でプロジェクトへのご招待が解放されます
          </p>
        )}
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <p className="text-xs font-semibold text-gray-600">AIクローンbotとは？</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            あなたがトランペディアに積み重ねた回答・思考・演奏理論をもとに、
            <span className="font-medium text-gray-700">あなた自身の知識を再現するAIボット</span>を
            一緒に作るプロジェクトです。
          </p>
        </div>
      </div>

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
