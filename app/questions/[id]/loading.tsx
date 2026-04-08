export default function QuestionLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* サムネイル */}
      <div className="h-40 bg-gray-200 rounded-2xl" />

      {/* タイトル＋メタ */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-gray-100 rounded-full" />
          <div className="h-5 w-12 bg-gray-100 rounded-full" />
        </div>
        <div className="h-7 w-4/5 bg-gray-200 rounded" />
        <div className="h-7 w-3/5 bg-gray-200 rounded" />
        <div className="h-4 w-28 bg-gray-100 rounded" />
      </div>

      {/* 本文 */}
      <div className="space-y-2">
        {[1, 0.9, 0.95, 0.7].map((w, i) => (
          <div key={i} className="h-3.5 bg-gray-100 rounded" style={{ width: `${w * 100}%` }} />
        ))}
      </div>

      {/* 区切り */}
      <div className="border-t border-gray-100" />

      {/* 回答一覧 */}
      <div className="space-y-4">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        {[0, 1].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gray-200 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-28 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-100 rounded" />
              </div>
            </div>
            {[1, 0.9, 0.8, 0.5].map((w, j) => (
              <div key={j} className="h-3 bg-gray-100 rounded" style={{ width: `${w * 100}%` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
