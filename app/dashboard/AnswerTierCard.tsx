import type { CSSProperties } from "react";
import { Crown, Gem, Medal, Sparkles, Star, Trophy } from "lucide-react";
import { TIERS, getTier } from "@/lib/answerTier";
import TierCornerOrnament from "@/app/components/TierCornerOrnament";

export default function AnswerTierCard({ totalAnswers }: { totalAnswers: number }) {
  const tier = getTier(totalAnswers);
  const nextTier = TIERS[tier.index + 1] ?? null;
  const toNext = nextTier ? nextTier.min - totalAnswers : 0;
  const progress = nextTier
    ? Math.min(((totalAnswers - tier.min) / (nextTier.min - tier.min)) * 100, 100)
    : 100;

  const isLegendary = tier.index === 7;
  const isElite     = tier.index >= 6;
  const isAdvanced  = tier.index >= 4;
  const isMid       = tier.index >= 2;

  const accent = isLegendary ? "#b45309"
    : isElite    ? "#be123c"
    : isAdvanced ? "#b45309"
    : isMid      ? "#4f46e5"
    : "#334155";

  const ink = isLegendary ? "#422006"
    : isElite    ? "#4c0519"
    : isAdvanced ? "#451a03"
    : isMid      ? "#172554"
    : "#0f172a";

  const muted = isLegendary ? "#92400e"
    : isElite    ? "#9f1239"
    : isAdvanced ? "#a16207"
    : isMid      ? "#4338ca"
    : "#64748b";

  const iconBg = isLegendary ? "linear-gradient(135deg, #fffbeb, #fbbf24, #92400e)"
    : isElite    ? "linear-gradient(135deg, #fff1f2, #fb7185, #9f1239)"
    : isAdvanced ? "linear-gradient(135deg, #fef3c7, #f59e0b, #92400e)"
    : isMid      ? "linear-gradient(135deg, #eef2ff, #818cf8, #3730a3)"
    : "linear-gradient(135deg, #f8fafc, #cbd5e1, #475569)";

  const Icon = isLegendary ? Crown
    : isElite    ? Gem
    : isAdvanced ? Medal
    : isMid      ? Star
    : Trophy;

  const achieved = nextTier ? totalAnswers - tier.min : totalAnswers;
  const span = nextTier ? nextTier.min - tier.min : Math.max(totalAnswers, 1);
  const tierNumber = String(tier.index + 1).padStart(2, "0");
  const tierTotal = String(TIERS.length).padStart(2, "0");

  return (
    <div
      className={`answer-tier-card ${tier.shape} ${tier.glow} ${tier.shimmerClass}`}
      style={{
        "--tier-bg": tier.cardInlineBg,
        "--tier-bar": tier.barInlineBg,
        "--tier-accent": accent,
        "--tier-ink": ink,
        "--tier-muted": muted,
        "--tier-icon-bg": iconBg,
      } as CSSProperties}
    >
      <div className="answer-tier-card__aura" aria-hidden="true" />
      <div className="answer-tier-card__grain" aria-hidden="true" />

      <TierCornerOrnament
        level={tier.ornamentLevel}
        colorClass={tier.ornamentColor}
        size={isLegendary ? 58 : isElite ? 50 : 40}
      />

      <div className="relative z-10">
        <div className="answer-tier-card__ribbon">
          <span>Fellow Rank</span>
          <strong>{tierNumber} / {tierTotal}</strong>
        </div>

        <div className="answer-tier-card__top">
          <div className="answer-tier-card__identity">
            <div className="answer-tier-card__medallion" aria-hidden="true">
              <Icon size={isLegendary ? 28 : 24} strokeWidth={2.2} />
            </div>

            <div className="min-w-0">
              <div className="answer-tier-card__eyebrow">
                <Sparkles size={13} aria-hidden="true" />
                <span>Answer Tier</span>
              </div>
              <h2 className="answer-tier-card__title">{tier.label}</h2>
              <p className="answer-tier-card__subtitle">{tier.en}</p>
            </div>
          </div>

          <div className="answer-tier-card__count" aria-label={`回答数 ${totalAnswers}件`}>
            <em>Total</em>
            <span>{totalAnswers}</span>
            <small>回答</small>
          </div>
        </div>

        {nextTier ? (
          <div className="answer-tier-card__progress">
            <div className="answer-tier-card__progress-head">
              <span>
                次のランク <strong>{nextTier.label}</strong>
              </span>
              <strong>あと {toNext} 件</strong>
            </div>

            <div className="answer-tier-card__track" aria-hidden="true">
              <div
                className="answer-tier-card__fill"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <div className="answer-tier-card__range">
              <span>{tier.min}</span>
              <span>{nextTier.min}</span>
            </div>
          </div>
        ) : (
          <div className="answer-tier-card__max">
            <Crown size={16} aria-hidden="true" />
            <span>最高ランク到達</span>
          </div>
        )}

        <div className="answer-tier-card__stats" aria-label="ランク進捗">
          <div>
            <span>現在</span>
            <strong>{tier.min}+</strong>
          </div>
          <div>
            <span>達成</span>
            <strong>{Math.round(progress)}%</strong>
          </div>
          <div>
            <span>区間</span>
            <strong>{Math.max(achieved, 0)}/{span}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
