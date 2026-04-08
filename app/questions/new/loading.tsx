export default function NewQuestionLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      {/* タイトル */}
      <div className="h-7 w-48 bg-gray-200 rounded-lg" />

      {/* フォームフィールド */}
      <div className="space-y-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className={`bg-gray-100 rounded-xl ${i === 1 ? "h-36" : "h-11"}`} />
          </div>
        ))}
      </div>

      {/* 送信ボタン */}
      <div className="h-11 w-32 bg-teal-100 rounded-xl" />
    </div>
  );
}
