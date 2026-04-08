export default function ContributorLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* プロフィールヘッダー */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 bg-gray-200 rounded-full shrink-0" />
          <div className="flex-1 space-y-2.5 pt-1">
            <div className="h-6 w-36 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-4/5 bg-gray-100 rounded" />
          </div>
        </div>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* 回答一覧 */}
      <div className="space-y-3">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-2/3 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
