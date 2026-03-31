import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const role = session.user.role;
  if (role !== "fellow" && role !== "admin") redirect("/");

  const userId = session.user.id;

  // 合計回答数
  const totalAnswers = await prisma.answer.count({ where: { userId } });

  // 自分が回答した質問の合計被閲覧数
  const answeredQuestions = await prisma.question.findMany({
    where: { answers: { some: { userId } } },
    select: { views: true },
  });
  const totalViews = answeredQuestions.reduce((sum, q) => sum + q.views, 0);

  // 未回答の承認済み質問数（誰も回答していない）
  const unansweredCount = await prisma.question.count({
    where: { status: "approved", answers: { none: {} } },
  });

  const cloneProgress = Math.min(totalAnswers, 100);
  const clonePercent = cloneProgress;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {session.user.name ?? "Fellow"} さんの貢献サマリー
        </p>
      </div>

      {/* 統計ウィジェット */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="合計回答数"
          value={totalAnswers}
          unit="件"
          color="teal"
          description="これまでに投稿した回答の総数"
        />
        <StatCard
          label="合計被閲覧数"
          value={totalViews}
          unit="回"
          color="blue"
          description="あなたが回答した質問の総閲覧数"
        />
        <StatCard
          label="未回答の質問"
          value={unansweredCount}
          unit="件"
          color="amber"
          description="まだ誰も回答していない承認済み質問"
          href="/?sort=createdAt&order=desc"
          hrefLabel="質問を見る"
        />
      </div>

      {/* AIクローン進捗バー */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">

        {/* 進捗ヘッダー */}
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

        {/* プログレスバー */}
        <div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${clonePercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span>0件</span>
            <span>100件</span>
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

        {/* AIクローンbotプロジェクト説明 */}
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <p className="text-xs font-semibold text-gray-600">AIクローンbotとは？</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            あなたがトランペディアに積み重ねた回答・思考・演奏理論をもとに、
            <span className="font-medium text-gray-700">あなた自身の知識を再現するAIボット</span>を
            一緒に作るプロジェクトです。
            完成したbotはトランペディア上に「{session.user.name ?? "あなた"} AI」として公開され、
            24時間365日あなたの代わりに質問者へアドバイスを届けます。
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            ※ プロジェクトへの参加・botの内容確認・公開停止はいつでも申請できます。
          </p>
        </div>
      </div>

      {/* 未回答の質問へのCTA */}
      {unansweredCount > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal-800">
              {unansweredCount}件の質問があなたの回答を待っています
            </p>
            <p className="text-xs text-teal-600 mt-0.5">
              あなたの知識でコミュニティに貢献しましょう
            </p>
          </div>
          <Link
            href="/?sort=createdAt&order=desc"
            className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            質問を見る
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  color,
  description,
  href,
  hrefLabel,
}: {
  label: string;
  value: number;
  unit: string;
  color: "teal" | "blue" | "amber";
  description: string;
  href?: string;
  hrefLabel?: string;
}) {
  const colorMap = {
    teal: {
      bg: "bg-teal-50",
      border: "border-teal-200",
      value: "text-teal-700",
      link: "text-teal-600 hover:text-teal-800",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      value: "text-blue-700",
      link: "text-blue-600 hover:text-blue-800",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      value: "text-amber-700",
      link: "text-amber-600 hover:text-amber-800",
    },
  };
  const c = colorMap[color];

  return (
    <div className={`${c.bg} ${c.border} border rounded-2xl p-5`}>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${c.value}`}>
        {value.toLocaleString()}
        <span className="text-sm font-normal ml-1">{unit}</span>
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
