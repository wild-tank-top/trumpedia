export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* タブ */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[80, 64, 96].map((w, i) => (
          <div key={i} className="h-8 rounded-lg bg-gray-100" style={{ width: w }} />
        ))}
      </div>

      {/* テーブルヘッダー */}
      <div className="flex gap-4">
        {[1, 0.4, 0.3, 0.2].map((w, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded flex-1" style={{ flex: w }} />
        ))}
      </div>

      {/* テーブル行 */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-2 border-b border-gray-100">
          <div className="flex-1 h-4 bg-gray-100 rounded" />
          <div className="w-16 h-5 bg-gray-100 rounded-full" />
          <div className="w-12 h-4 bg-gray-100 rounded" />
          <div className="w-20 h-7 bg-gray-100 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
