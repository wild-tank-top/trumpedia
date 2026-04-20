import { Trophy, Star, Sparkles } from "lucide-react";
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

  // ── per-tier text colors ────────────────────────────────────
  const nameColor = isLegendary ? "#78350f"
    : isElite    ? "#881337"
    : isAdvanced ? "#78350f"  // amber dark
    : isMid      ? "#3730a3"
    : "#111827";

  const subColor = isLegendary ? "#b45309"
    : isElite    ? "#be123c"
    : isAdvanced ? "#d97706"
    : isMid      ? "#6d28d9"
    : "#6b7280";

  // ── progress bar glow per tier ──────────────────────────────
  const barGlow = isLegendary
    ? "0 0 10px rgba(251,191,36,0.7), 0 0 20px rgba(245,158,11,0.4)"
    : isElite
    ? "0 0 6px rgba(251,113,133,0.6)"
    : isAdvanced
    ? "0 0 5px rgba(245,158,11,0.5)"
    : isMid
    ? "0 0 4px rgba(139,92,246,0.4)"
    : "none";

  const barHeight = isLegendary ? 10 : isElite ? 8 : isAdvanced ? 7 : 5;

  return (
    <div
      className={`${tier.shape} ${tier.glow} ${tier.shimmerClass} transition-all duration-500`}
      style={{ background: tier.cardInlineBg, padding: isLegendary ? "28px" : isElite ? "24px" : "20px" }}
    >
      <TierCornerOrnament
        level={tier.ornamentLevel}
        colorClass={tier.ornamentColor}
        size={isLegendary ? 52 : isElite ? 44 : 36}
      />

      {/* ── Top row: icon + label + count ── */}
      <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
        <div className="flex-1 min-w-0">

          {/* Tier rank label */}
          <div className="flex items-center gap-1.5 mb-2">
            {isLegendary ? (
              <Sparkles size={13} style={{ color: "#f59e0b", fill: "#fde68a" }} />
            ) : isElite ? (
              <Star size={12} style={{ color: "#fb7185", fill: "#fecdd3" }} />
            ) : (
              <Trophy
                size={12}
                style={{ color: isMid ? "#818cf8" : "#9ca3af" }}
              />
            )}
            <span
              style={{
                fontSize: "0.62rem",
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: subColor,
              }}
            >
              Answer Tier
            </span>
          </div>

          {/* Tier name */}
          <h2
            style={{
              fontFamily: isMid ? "var(--font-playfair, 'Playfair Display', Georgia, serif)" : "inherit",
              fontWeight: isLegendary ? 900 : 700,
              fontSize: isLegendary ? "1.25rem" : isElite ? "1.1rem" : "1rem",
              color: nameColor,
              lineHeight: 1.3,
              letterSpacing: isLegendary ? "-0.02em" : "-0.01em",
            }}
          >
            {tier.label}
          </h2>

          {/* English badge */}
          <div className="mt-2">
            <span
              className={`inline-block text-[11px] font-bold px-3 py-0.5 rounded-full ${tier.badge}`}
              style={
                isLegendary
                  ? {
                      background: "linear-gradient(90deg, #fde68a, #fbbf24, #fde68a)",
                      color: "#78350f",
                      boxShadow: "0 1px 8px rgba(251,191,36,0.45)",
                    }
                  : isElite
                  ? { boxShadow: "0 1px 5px rgba(251,113,133,0.3)" }
                  : {}
              }
            >
              {tier.en}
            </span>
          </div>
        </div>

        {/* Answer count */}
        <div className="text-right shrink-0 relative z-10">
          <div
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
              fontWeight: 900,
              fontSize: isLegendary ? "3.5rem" : isElite ? "3rem" : "2.5rem",
              lineHeight: 1,
              color: nameColor,
              textShadow: isLegendary
                ? "0 2px 12px rgba(251,191,36,0.3)"
                : "none",
            }}
          >
            {totalAnswers}
          </div>
          <p
            style={{
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: subColor,
              marginTop: "2px",
            }}
          >
            回答数
          </p>
        </div>
      </div>

      {/* ── Progress section ── */}
      <div className="relative z-10">
        {nextTier ? (
          <>
            <div className="flex items-center justify-between mb-1.5">
              <span style={{ fontSize: "0.68rem", color: subColor, opacity: 0.8 }}>
                次「
                <span style={{ fontWeight: 700 }}>{nextTier.label}</span>
                」まで
              </span>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: nameColor }}>
                あと {toNext} 件
              </span>
            </div>

            {/* Track */}
            <div
              style={{
                width: "100%",
                height: `${barHeight}px`,
                borderRadius: `${barHeight}px`,
                background: "rgba(0,0,0,0.07)",
                overflow: "hidden",
              }}
            >
              {/* Fill */}
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(progress, 100)}%`,
                  borderRadius: `${barHeight}px`,
                  background: tier.barInlineBg,
                  boxShadow: barGlow,
                  transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </div>

            <div className="flex justify-between mt-1">
              <span style={{ fontSize: "0.6rem", color: "#9ca3af" }}>{tier.min}</span>
              <span style={{ fontSize: "0.6rem", color: "#9ca3af" }}>{nextTier.min}</span>
            </div>
          </>
        ) : (
          <div
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl"
            style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}
          >
            <Sparkles size={14} style={{ color: "#f59e0b", fill: "#fde68a" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#92400e" }}>
              最高ランク到達 ✨
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
