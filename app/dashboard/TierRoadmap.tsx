import { getTier, TIERS } from "@/lib/answerTier";
import { Cpu, Lock } from "lucide-react";

export default function TierRoadmap({ totalAnswers }: { totalAnswers: number }) {
  const currentTier = getTier(totalAnswers);
  const nextTier    = TIERS[currentTier.index + 1] ?? null;
  const toNext      = nextTier ? nextTier.min - totalAnswers : 0;
  const progress    = nextTier
    ? Math.min(Math.round(((totalAnswers - currentTier.min) / (nextTier.min - currentTier.min)) * 100), 100)
    : 100;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-800">Tier Roadmap</h2>
        <p className="text-xs text-gray-500 mt-0.5">回答を重ねてランクアップしよう</p>
      </div>

      {/* ── ミルストーン一覧 ── */}
      <ol className="space-y-1">
        {TIERS.map((tier, i) => {
          const isDone    = i < currentTier.index;
          const isCurrent = i === currentTier.index;

          return (
            <li
              key={tier.min}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isCurrent
                  ? `${tier.bg} ${tier.border} border shadow-sm`
                  : isDone
                  ? "opacity-60"
                  : "opacity-30"
              }`}
            >
              {/* ステップ番号 / チェック */}
              <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                isCurrent ? tier.badge :
                isDone    ? "bg-gray-100 text-gray-400" :
                            "bg-gray-100 text-gray-300"
              }`}>
                {isDone ? "✓" : i + 1}
              </span>

              {/* ランク名 */}
              <span className={`flex-1 text-xs font-medium truncate ${
                isCurrent ? "text-gray-800" : "text-gray-500"
              }`}>
                {tier.label}
              </span>

              {/* バッジ */}
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                isCurrent ? tier.badge : "bg-gray-100 text-gray-400"
              }`}>
                {tier.en}
              </span>

              {/* 件数 */}
              <span className="text-[10px] text-gray-400 shrink-0 w-14 text-right">
                {tier.min === 0 ? "0〜4件" : `${tier.min}件〜`}
              </span>
            </li>
          );
        })}
      </ol>

      {/* ── Noble Rot Gold 達成 → AIクローンティーザー ── */}
      {totalAnswers >= 100 ? (
        <div className="mt-3 rounded-xl border border-yellow-400 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 px-4 py-4 shadow-md shadow-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={15} className="text-amber-600 shrink-0" />
            <span className="text-xs font-bold text-amber-800 tracking-wide">
              AI クローンプロジェクト — 解放
            </span>
            <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 border border-amber-300">
              構想中
            </span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            あなたの蓄積された思考・演奏哲学を学習し、24時間365日あなたに代わって悩みを受け止める
            <span className="font-semibold">「パーソナル AI 分身」</span>
            作成プロジェクトへの参加資格を獲得しました。詳細は管理者までお問い合わせください。
          </p>
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 flex items-center gap-3 opacity-50">
          <Lock size={13} className="text-gray-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-500">
              AI クローンプロジェクト
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Noble Rot Gold（100件）到達で解放
            </p>
          </div>
          <span className="ml-auto text-[10px] font-medium text-gray-400 shrink-0">
            あと {Math.max(0, 100 - totalAnswers)} 件
          </span>
        </div>
      )}

      {/* ── 次ティアへのプログレスバー ── */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        {nextTier ? (
          <>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>
                次のランク
                <span className={`ml-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${nextTier.badge}`}>
                  {nextTier.en}
                </span>
                まで
              </span>
              <span className="font-semibold text-gray-700">あと {toNext} 件</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${currentTier.bar}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>{currentTier.min}件</span>
              <span>{nextTier.min}件</span>
            </div>
          </>
        ) : (
          <p className="text-sm font-semibold text-center text-amber-600">✨ 最高ランク到達！</p>
        )}
      </div>
    </div>
  );
}
