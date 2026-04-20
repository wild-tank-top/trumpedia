"use client";

import { useRouter } from "next/navigation";
import { TIERS } from "@/lib/answerTier";

export default function TierPreviewSelector({ current }: { current: number }) {
  const router = useRouter();

  function handleSelect(min: number) {
    document.cookie = `tier_preview=${min}; path=/; max-age=86400`;
    router.refresh();
  }

  function handleClear() {
    document.cookie = "tier_preview=; path=/; max-age=0";
    router.refresh();
  }

  return (
    <div className="border border-dashed border-red-200 bg-red-50 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-red-500 uppercase tracking-widest">
          Admin: Tier Preview
        </p>
        <button
          onClick={handleClear}
          className="text-xs text-red-400 hover:text-red-600 underline"
        >
          リセット
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TIERS.map((t, i) => {
          const isActive = current >= t.min && (TIERS[i + 1]?.min ?? Infinity) > current;
          return (
            <button
              key={t.min}
              onClick={() => handleSelect(t.min)}
              className={`relative overflow-hidden text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all ${
                isActive
                  ? `${t.border} text-gray-700 shadow-sm scale-105 ${t.shimmerClass}`
                  : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
              }`}
              style={isActive ? { background: t.cardInlineBg } : undefined}
            >
              {t.min}件〜
            </button>
          );
        })}
      </div>
    </div>
  );
}
