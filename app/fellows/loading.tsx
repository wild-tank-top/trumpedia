export default function FellowsLoading() {
  return (
    <div className="animate-pulse">
      {/* ヘッダー */}
      <div className="mb-6 space-y-2">
        <div className="h-7 w-28 bg-gray-200 rounded-lg" />
        <div className="h-4 w-52 bg-gray-100 rounded" />
      </div>

      {/* 検索バー */}
      <div className="mb-6 h-10 bg-gray-100 rounded-xl" />

      {/* Fellows グリッド */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-3">
            <div className="h-16 w-16 bg-gray-200 rounded-full" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-3 w-28 bg-gray-100 rounded" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
