/**
 * app/loading.tsx
 * ページ遷移・初回ロード中に表示されるスケルトン。
 * 実際のページ構造に合わせた骨格を表示し、レイアウトシフトを最小化。
 */
export default function Loading() {
  const catWidths = [56, 48, 64, 64, 128, 96, 80, 112, 72, 104];

  return (
    <div className="animate-pulse">
      {/* ── 検索窓 ── */}
      <div className="mb-3 h-10 bg-gray-100 rounded-xl" />

      {/* ── カテゴリフィルター ── */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {[48, ...catWidths].map((w, i) => (
          <div
            key={i}
            className={`h-6 rounded-full ${i === 0 ? "bg-teal-200" : "bg-gray-100"}`}
            style={{ width: w }}
          />
        ))}
      </div>

      {/* ── AIナビゲーターボタン ── */}
      <div className="mb-6 h-12 bg-teal-50 border border-dashed border-teal-200 rounded-xl" />

      {/* ── ソート＋件数バー ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 w-10 bg-gray-100 rounded" />
        <div className="hidden sm:flex items-center gap-1.5">
          <div className="h-3 w-14 bg-gray-100 rounded mr-1" />
          {[56, 72, 56, 56].map((w, i) => (
            <div key={i} className="h-7 rounded-full bg-gray-100" style={{ width: w }} />
          ))}
        </div>
      </div>

      {/* ── 質問カードグリッド ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="h-1 bg-gray-200" />
            <div className="h-[88px] bg-gray-100" />
            <div className="p-4 space-y-2.5">
              <div className="flex gap-1.5">
                <div className="h-5 w-16 bg-gray-100 rounded-full" />
                <div className="h-5 w-12 bg-gray-100 rounded-full" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3.5 bg-gray-100 rounded w-full" />
                <div className="h-3.5 bg-gray-100 rounded w-4/5" />
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-3/5" />
              </div>
              <div className="flex justify-between pt-1">
                <div className="h-3 w-20 bg-gray-100 rounded" />
                <div className="h-3 w-14 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
