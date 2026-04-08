export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* タイトル */}
      <div className="space-y-2">
        <div className="h-7 w-36 bg-gray-200 rounded-lg" />
        <div className="h-4 w-52 bg-gray-100 rounded" />
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="h-9 w-24 bg-gray-200 rounded" />
            <div className="h-3 w-36 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Tier カード */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-gray-200 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-48 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full" />
      </div>

      {/* Tier Roadmap */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
        <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <div className="h-5 w-5 bg-gray-100 rounded-full shrink-0" />
            <div className="flex-1 h-3 bg-gray-100 rounded" />
            <div className="h-5 w-20 bg-gray-100 rounded-full" />
            <div className="h-3 w-14 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* 招待コード */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
        <div className="h-4 w-28 bg-gray-200 rounded mb-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 flex-1 bg-gray-100 rounded" />
            <div className="h-6 w-16 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
