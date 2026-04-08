export default function NotificationsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-6 w-6 bg-gray-200 rounded-full" />
        <div className="h-6 w-16 bg-gray-200 rounded" />
      </div>

      {/* 通知リスト */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
          <div className="h-2 w-2 bg-teal-200 rounded-full mt-2 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-14 bg-gray-100 rounded-full" />
            <div className="h-4 w-4/5 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
