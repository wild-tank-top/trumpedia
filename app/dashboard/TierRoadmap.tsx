import { getTier, TIERS } from "@/lib/answerTier";
import { Lock, Check } from "lucide-react";

const ALWAYS_VISIBLE_UP_TO = 5;

export default function TierRoadmap({ totalAnswers }: { totalAnswers: number }) {
  const currentTier = getTier(totalAnswers);
  const nextTier    = TIERS[currentTier.index + 1] ?? null;
  const toNext      = nextTier ? nextTier.min - totalAnswers : 0;
  const progress    = nextTier
    ? Math.min(Math.round(((totalAnswers - currentTier.min) / (nextTier.min - currentTier.min)) * 100), 100)
    : 100;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      {/* Header */}
      <div className="mb-5 flex items-baseline justify-between">
        <div>
          <h2
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
              fontWeight: 700,
              fontSize: "1.05rem",
              color: "#111827",
              letterSpacing: "-0.01em",
            }}
          >
            Tier Roadmap
          </h2>
          <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "2px" }}>
            回答を重ねてランクアップしよう
          </p>
        </div>
        <span
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#d1d5db",
          }}
        >
          {currentTier.index + 1} / {TIERS.length}
        </span>
      </div>

      {/* Timeline */}
      <ol className="relative" style={{ paddingLeft: "28px" }}>
        {/* Vertical spine */}
        <div
          className="absolute left-0 top-2 bottom-2"
          style={{
            width: "2px",
            marginLeft: "9px",
            background: "linear-gradient(180deg, #e5e7eb 0%, #f3f4f6 100%)",
          }}
        />

        {TIERS.map((tier, i) => {
          const isDone    = i < currentTier.index;
          const isCurrent = i === currentTier.index;
          const isNext    = i === currentTier.index + 1;
          const isFuture  = i > currentTier.index + 1;

          const nameVisible  = i <= ALWAYS_VISIBLE_UP_TO || currentTier.index >= i - 1;
          const countVisible = !isFuture;

          // ── dot styles per state ──────────────────────────────────
          const dotSize = isCurrent ? 20 : isDone ? 16 : 14;

          const dotStyle: React.CSSProperties = isCurrent
            ? {
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                borderRadius: "50%",
                background: tier.barInlineBg,
                boxShadow: `0 0 0 4px white, 0 0 0 6px currentColor, 0 2px 8px rgba(0,0,0,0.15)`,
                flexShrink: 0,
                position: "relative",
                zIndex: 1,
              }
            : isDone
            ? {
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                borderRadius: "50%",
                background: "#d1fae5",
                border: "2px solid #6ee7b7",
                flexShrink: 0,
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }
            : {
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                borderRadius: "50%",
                background: "#f9fafb",
                border: "2px solid #e5e7eb",
                flexShrink: 0,
                position: "relative",
                zIndex: 1,
              };

          // current tier dot gets a ring
          const dotRingStyle: React.CSSProperties = isCurrent ? {
            position: "absolute",
            inset: "-5px",
            borderRadius: "50%",
            border: `2px solid transparent`,
            background: `${tier.barInlineBg} border-box`,
            WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "destination-out",
            maskComposite: "exclude",
            opacity: 0.4,
          } : {};

          // row style
          const rowOpacity = isDone ? 0.55 : isFuture ? 0.38 : isNext ? 0.82 : 1;

          const rowBg: React.CSSProperties = isCurrent
            ? {
                background: tier.cardInlineBg,
                border: `1px solid`,
                borderColor: "transparent",
                borderRadius: "14px",
                padding: "10px 12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }
            : {
                borderRadius: "10px",
                padding: "7px 10px",
              };

          return (
            <li
              key={tier.min}
              className="flex items-center gap-3 mb-1 transition-all duration-300"
              style={{ opacity: rowOpacity, ...rowBg }}
            >
              {/* Timeline dot — positioned to sit on the spine */}
              <div
                style={{
                  ...dotStyle,
                  marginLeft: "-34px",
                  marginRight: "10px",
                }}
              >
                {isCurrent && (
                  <div style={dotRingStyle} />
                )}
                {isDone && (
                  <Check size={8} style={{ color: "#059669", strokeWidth: 3 }} />
                )}
              </div>

              {/* Tier name */}
              <span
                style={{
                  flex: 1,
                  fontSize: isCurrent ? "0.82rem" : "0.75rem",
                  fontWeight: isCurrent ? 700 : isDone ? 500 : 500,
                  color: isCurrent ? "#111827" : isDone ? "#6b7280" : "#9ca3af",
                  fontFamily: isCurrent && i >= 2
                    ? "var(--font-playfair, 'Playfair Display', Georgia, serif)"
                    : "inherit",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.4,
                }}
              >
                {nameVisible ? tier.label : (
                  <span style={{ fontStyle: "italic", color: "#d1d5db" }}>前ランク到達で解放</span>
                )}
              </span>

              {/* English badge — current only */}
              {nameVisible && isCurrent && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${tier.badge}`}
                  style={{ fontSize: "0.65rem" }}
                >
                  {tier.en}
                </span>
              )}

              {/* Count or lock */}
              {countVisible ? (
                <span
                  style={{
                    fontSize: "0.62rem",
                    color: isCurrent ? "#6b7280" : "#d1d5db",
                    flexShrink: 0,
                    width: "52px",
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {tier.min === 0 ? "0〜4件" : `${tier.min}件〜`}
                </span>
              ) : (
                <span style={{ flexShrink: 0, width: "52px", display: "flex", justifyContent: "flex-end" }}>
                  <Lock size={9} style={{ color: "#e5e7eb" }} />
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Progress footer */}
      <div
        className="mt-5 pt-4"
        style={{ borderTop: "1px solid #f3f4f6" }}
      >
        {nextTier ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>
                次のランク
                <span
                  className={`ml-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${nextTier.badge}`}
                  style={{ fontSize: "0.65rem" }}
                >
                  {nextTier.en}
                </span>
                まで
              </span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#374151" }}>
                あと {toNext} 件
              </span>
            </div>

            {/* Progress bar */}
            <div
              style={{
                width: "100%",
                height: "6px",
                borderRadius: "6px",
                background: "#f3f4f6",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  borderRadius: "6px",
                  background: currentTier.barInlineBg,
                  transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </div>

            <div className="flex justify-between mt-1">
              <span style={{ fontSize: "0.6rem", color: "#d1d5db" }}>{currentTier.min}件</span>
              <span style={{ fontSize: "0.6rem", color: "#d1d5db" }}>{nextTier.min}件</span>
            </div>
          </>
        ) : (
          <p
            style={{
              textAlign: "center",
              fontWeight: 700,
              fontSize: "0.85rem",
              color: "#d97706",
              fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
            }}
          >
            ✨ 最高ランク到達！
          </p>
        )}
      </div>
    </div>
  );
}
