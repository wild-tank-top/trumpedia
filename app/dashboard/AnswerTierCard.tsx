import { Trophy } from "lucide-react";
import { TIERS, getTier } from "@/lib/answerTier";

export default function AnswerTierCard({ totalAnswers }: { totalAnswers: number }) {
  const tier = getTier(totalAnswers);
  const nextTier = TIERS[tier.index + 1] ?? null;
  const toNext = nextTier ? nextTier.min - totalAnswers : 0;
  const progress = nextTier
    ? ((totalAnswers - tier.min) / (nextTier.min - tier.min)) * 100
    : 100;

  return (
    <div className={`border-2 rounded-2xl p-5 transition-all ${tier.border} ${tier.glow}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Trophy
              size={16}
              className={tier.index >= 5 ? "text-yellow-500 fill-yellow-400" : "text-gray-400"}
            />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Answer Tier
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-800">{tier.label}</span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${tier.badge}`}>
              {tier.en}
            </span>
          </div>
          {nextTier ? (
            <p className="text-xs text-gray-400 mt-1">
              次のランク「{nextTier.label}」まで
              <span className="font-semibold text-gray-600 mx-1">{toNext}件</span>
            </p>
          ) : (
            <p className="text-xs text-amber-600 font-semibold mt-1">最高ランク到達 ✨</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-3xl font-bold text-gray-800">{totalAnswers}</p>
          <p className="text-xs text-gray-400">回答数</p>
        </div>
      </div>

      {nextTier && (
        <div className="mt-4">
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-700 ${
                tier.index >= 5
                  ? "bg-gradient-to-r from-amber-400 to-yellow-400"
                  : tier.index >= 3
                  ? "bg-gradient-to-r from-violet-400 to-blue-400"
                  : "bg-gradient-to-r from-teal-400 to-blue-400"
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>{tier.min}件</span>
            <span>{nextTier.min}件</span>
          </div>
        </div>
      )}
    </div>
  );
}
