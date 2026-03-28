"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";

type SortKey = "createdAt" | "views" | "answers" | "lastAnsweredAt";
type OrderDir = "asc" | "desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "createdAt",      label: "投稿日" },
  { key: "lastAnsweredAt", label: "最新回答" },
  { key: "answers",        label: "回答数" },
  { key: "views",          label: "閲覧数" },
];

export default function SortControl({
  currentSort,
  currentOrder,
}: {
  currentSort: SortKey;
  currentOrder: OrderDir;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function navigate(sort: SortKey, order: OrderDir) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.set("order", order);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
    setDrawerOpen(false);
  }

  function handleClick(key: SortKey) {
    if (key === currentSort) {
      // 同じキーなら昇降順を反転
      navigate(key, currentOrder === "desc" ? "asc" : "desc");
    } else {
      // 新しいキーはデフォルト降順
      navigate(key, "desc");
    }
  }

  const dirIcon = (key: SortKey) => {
    if (key !== currentSort) return null;
    return currentOrder === "desc" ? " ↓" : " ↑";
  };

  return (
    <>
      {/* ── PC: 横並びボタン ─────────────────────────────── */}
      <div className="hidden sm:flex items-center gap-1.5">
        <span className="text-xs text-gray-400 mr-1">並び替え</span>
        {SORT_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleClick(key)}
            disabled={isPending}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              currentSort === key
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } disabled:opacity-50`}
          >
            {label}{dirIcon(key)}
          </button>
        ))}
      </div>

      {/* ── Mobile: ドロワーボタン ────────────────────────── */}
      <div className="sm:hidden flex justify-end mb-3">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 12h12M10 17h4" />
          </svg>
          並び替え：{SORT_OPTIONS.find((o) => o.key === currentSort)?.label}
          {currentOrder === "desc" ? " ↓" : " ↑"}
        </button>
      </div>

      {/* ── Mobile: ドロワー ──────────────────────────────── */}
      {drawerOpen && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed inset-0 bg-black/30 z-40 sm:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          {/* ドロワー本体 */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl p-5 shadow-xl sm:hidden">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-800 text-sm">並び替え</p>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-1">
              {SORT_OPTIONS.map(({ key, label }) => {
                const isActive = currentSort === key;
                const nextOrder = isActive
                  ? currentOrder === "desc" ? "asc" : "desc"
                  : "desc";
                return (
                  <button
                    key={key}
                    onClick={() => navigate(key, nextOrder)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${
                      isActive
                        ? "bg-teal-50 text-teal-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{label}</span>
                    {isActive && (
                      <span className="text-teal-500">
                        {currentOrder === "desc" ? "↓ 降順" : "↑ 昇順"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* 昇順・降順切り替え（アクティブ項目が選ばれている場合のみ） */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => navigate(currentSort, "desc")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  currentOrder === "desc"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                ↓ 降順
              </button>
              <button
                onClick={() => navigate(currentSort, "asc")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  currentOrder === "asc"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                ↑ 昇順
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
