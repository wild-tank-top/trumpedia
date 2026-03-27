/**
 * app/loading.tsx
 * Next.js App Router のルートレベル Suspense 境界。
 * サーバーコンポーネントのデータ取得中に自動表示される。
 */
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-4">
      {/* スピナー */}
      <div className="w-10 h-10 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
      <p className="text-sm text-gray-400 tracking-wide">読み込み中...</p>
    </div>
  );
}
