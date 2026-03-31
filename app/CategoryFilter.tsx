"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { CATEGORIES } from "@/lib/constants";

export default function CategoryFilter({ current }: { current?: string }) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 楽観的に「選択済み」として表示するカテゴリを保持（null = すべて）
  const [optimisticCat, setOptimisticCat] = useState<string | null | undefined>(undefined);

  // 遷移中は楽観的な値を、完了後はサーバーから返ってきた値を表示
  const activeCat = isPending && optimisticCat !== undefined ? optimisticCat : (current ?? null);

  function select(cat: string | null) {
    if (isPending) return;
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set("category", cat);
    } else {
      params.delete("category");
    }
    params.delete("page");
    setOptimisticCat(cat);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="mb-5 space-y-2">
      <div className={`flex flex-wrap gap-1.5 transition-opacity duration-150 ${isPending ? "opacity-60" : "opacity-100"}`}>
        {/* すべて */}
        <button
          onClick={() => select(null)}
          disabled={isPending}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            activeCat === null
              ? "bg-teal-600 text-white shadow-sm ring-2 ring-teal-300 ring-offset-1"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          すべて
        </button>

        {CATEGORIES.map((cat) => {
          const isActive = activeCat === cat;
          return (
            <button
              key={cat}
              onClick={() => select(cat)}
              disabled={isPending}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-teal-600 text-white shadow-sm ring-2 ring-teal-300 ring-offset-1"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ローディングバー：遷移中のみ表示 */}
      <div className={`h-0.5 rounded-full overflow-hidden transition-opacity duration-150 ${isPending ? "opacity-100" : "opacity-0"}`}>
        <div className="h-full bg-teal-400 rounded-full animate-[loading-bar_1.2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
