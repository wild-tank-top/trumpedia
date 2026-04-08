export default function EditQuestionLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 bg-gray-200 rounded-lg" />
        <div className="h-4 w-16 bg-gray-100 rounded" />
      </div>

      {/* フォームフィールド */}
      <div className="space-y-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className={`bg-gray-100 rounded-xl ${i === 1 ? "h-36" : "h-11"}`} />
          </div>
        ))}
      </div>

      {/* ボタン */}
      <div className="flex gap-3">
        <div className="h-10 w-24 bg-teal-100 rounded-xl" />
        <div className="h-10 w-20 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}
