"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Avatar from "@/app/components/Avatar";
import {
  GOJUON_ROWS,
  ALL_ROW_KEY,
  getGojuonRowKey,
  sortByYomi,
  type GojuonRowKey,
} from "@/lib/kana";
import { getTier } from "@/lib/answerTier";
import TierCornerOrnament from "@/app/components/TierCornerOrnament";

type Fellow = {
  id: string;
  name: string | null;
  image: string | null;
  yomi: string;
  profile: { bio: string | null; career: string | null } | null;
  _count: { answers: number };
};

export default function FellowFilter({
  fellows,
  adminId,
  adminPreviewCount,
}: {
  fellows: Fellow[];
  adminId?: string;
  adminPreviewCount?: number | null;
}) {
  const [activeRow, setActiveRow] = useState<GojuonRowKey | typeof ALL_ROW_KEY>(ALL_ROW_KEY);

  // 50音順にソート済みのリスト（一度だけ計算）
  const sorted = useMemo(() => sortByYomi(fellows), [fellows]);

  // 各行に何人いるか（ボタンの disabled 判定用）
  const rowCounts = useMemo(() => {
    const map = new Map<GojuonRowKey | typeof ALL_ROW_KEY, number>();
    map.set(ALL_ROW_KEY, fellows.length);
    for (const row of GOJUON_ROWS) {
      map.set(
        row.key,
        fellows.filter((f) => getGojuonRowKey(f.yomi, f.name ?? "") === row.key).length
      );
    }
    return map;
  }, [fellows]);

  // フィルタリング済みリスト
  const filtered = useMemo(() => {
    if (activeRow === ALL_ROW_KEY) return sorted;
    return sorted.filter(
      (f) => getGojuonRowKey(f.yomi, f.name ?? "") === activeRow
    );
  }, [sorted, activeRow]);

  const buttons = [
    { key: ALL_ROW_KEY as typeof ALL_ROW_KEY, label: "すべて" },
    ...GOJUON_ROWS.map((r) => ({ key: r.key as GojuonRowKey | typeof ALL_ROW_KEY, label: r.label })),
    { key: "その他" as GojuonRowKey | typeof ALL_ROW_KEY, label: "他" },
  ];

  return (
    <div>
      {/* ── 50音フィルター（折り返し） ─────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {buttons.map(({ key, label }) => {
          const count = key === "その他"
            ? fellows.filter((f) => getGojuonRowKey(f.yomi, f.name ?? "") === "その他").length
            : (rowCounts.get(key) ?? 0);
          const isActive = activeRow === key;
          const isEmpty  = key !== ALL_ROW_KEY && count === 0;

          return (
            <button
              key={key}
              onClick={() => setActiveRow(key as GojuonRowKey | typeof ALL_ROW_KEY)}
              disabled={isEmpty}
              className={[
                "h-9 px-3 rounded-lg text-sm font-medium transition-colors",
                "disabled:opacity-25 disabled:cursor-not-allowed",
                isActive
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700",
              ].join(" ")}
            >
              {label}
              {key !== ALL_ROW_KEY && !isEmpty && (
                <span className={`ml-1 text-xs ${isActive ? "text-amber-100" : "text-gray-400"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Fellows リスト ──────────────────────────── */}
      <div className="mt-4">
        {filtered.length === 0 ? (
          <p className="text-center py-12 text-gray-400 text-sm">
            該当するFellowメンバーがいません
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((fellow) => {
              const answerCount =
                adminId && fellow.id === adminId && adminPreviewCount !== null && adminPreviewCount !== undefined
                  ? adminPreviewCount
                  : fellow._count.answers;
              const t = getTier(answerCount);
              return (
              <Link
                key={fellow.id}
                href={`/contributors/${fellow.id}`}
                className={`p-4 transition-all flex items-center gap-3 ${t.shape} ${t.bg} ${t.border} ${t.glow} hover:opacity-80`}
              >
                <TierCornerOrnament level={t.ornamentLevel} colorClass={t.ornamentColor} size={26} />
                <Avatar src={fellow.image} name={fellow.name} size="md" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-gray-900 truncate">
                      {fellow.name ?? "名無し"}
                    </span>
                    <span className="shrink-0 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      Fellow
                    </span>
                  </div>
                  {fellow.profile?.bio && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{fellow.profile.bio}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    回答 {fellow._count.answers}件
                  </p>
                </div>

                <span className="text-gray-300 shrink-0 text-lg">›</span>
              </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
