export default function MyQuestionsLoading() {
  return (
    <div className="animate-pulse">
      {/* ヘッダー */}
      <div className="mb-6 space-y-2">
        <div className="h-7 w-40 bg-gray-200 rounded-lg" />
        <div className="h-4 w-32 bg-gray-100 rounded" />
      </div>

      {/* 質問リスト */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5">
            <div className="flex gap-2">
              <div className="h-5 w-14 bg-gray-100 rounded-full" />
              <div className="h-5 w-10 bg-gray-100 rounded-full" />
            </div>
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
            <div className="flex items-center justify-between pt-1">
              <div className="h-3 w-20 bg-gray-100 rounded" />
              <div className="h-6 w-16 bg-gray-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
