import { getTier, TIERS } from "@/lib/answerTier";
import { Lock } from "lucide-react";

// ランク名をデフォルト表示するインデックス上限（0〜4 = 悠久の琥珀・マデイラ まで）
const ALWAYS_VISIBLE_UP_TO = 4;

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
          const isNext    = i === currentTier.index + 1;
          const isLocked  = i > currentTier.index + 1;

          // ランク名の表示可否：index 0-5 は常に表示、6以降は前ランク到達後のみ
          const nameVisible = i <= ALWAYS_VISIBLE_UP_TO || currentTier.index >= i - 1;

          /* ── 鍵ロック行 ── */
          if (isLocked) {
            return (
              <li
                key={tier.min}
                className="flex items-center gap-3 px-3 py-2 rounded-xl opacity-25"
              >
                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Lock size={9} className="text-gray-400" />
                </span>
                <span className="flex-1 text-xs text-gray-400 tracking-widest">— — —</span>
                <span className="text-[10px] text-gray-300 shrink-0">
                  <Lock size={8} />
                </span>
              </li>
            );
          }

          /* ── 通常行（完了 / 現在 / 次） ── */
          return (
            <li
              key={tier.min}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isCurrent
                  ? `${tier.bg} ${tier.border} border shadow-sm`
                  : isDone
                  ? "opacity-60"
                  : "opacity-80"   // isNext
              }`}
            >
              {/* ステップ番号 / チェック */}
              <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                isCurrent ? tier.badge :
                isDone    ? "bg-gray-100 text-gray-400" :
                            "bg-gray-100 text-gray-500"
              }`}>
                {isDone ? "✓" : i + 1}
              </span>

              {/* ランク名（表示ルールに従う） */}
              <span className={`flex-1 text-xs font-medium truncate ${
                isCurrent ? "text-gray-800" : "text-gray-500"
              }`}>
                {nameVisible ? tier.label : (
                  <span className="italic text-gray-400">前ランク到達で解放</span>
                )}
              </span>

              {/* バッジ */}
              {nameVisible && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  isCurrent ? tier.badge : "bg-gray-100 text-gray-400"
                }`}>
                  {tier.en}
                </span>
              )}

              {/* 件数 */}
              <span className="text-[10px] text-gray-400 shrink-0 w-14 text-right">
                {tier.min === 0 ? "0〜4件" : `${tier.min}件〜`}
              </span>
            </li>
          );
        })}
      </ol>

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
