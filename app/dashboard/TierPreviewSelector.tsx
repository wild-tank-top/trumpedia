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
        {TIERS.map((t) => (
          <button
            key={t.min}
            onClick={() => handleSelect(t.min)}
            className={`text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-colors ${
              current >= t.min && (TIERS[TIERS.indexOf(t) + 1]?.min ?? Infinity) > current
                ? `${t.border} bg-white text-gray-700 shadow-sm`
                : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
            }`}
          >
            {t.min}件〜
          </button>
        ))}
      </div>
    </div>
  );
}
