"use client";

/**
 * app/error.tsx
 * Next.js App Router のルートレベルエラーバウンダリ。
 * サーバー / クライアントコンポーネントで未捕捉エラーが発生したときに表示される。
 */
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
      <div className="text-4xl">⚠️</div>
      <h2 className="text-lg font-bold text-gray-800">予期しないエラーが発生しました</h2>
      <p className="text-sm text-gray-500 max-w-xs">
        ページの読み込み中にエラーが起きました。
        {error.message && (
          <span className="block mt-1 text-xs text-gray-400 break-all">{error.message}</span>
        )}
      </p>
      <button
        onClick={reset}
        className="mt-2 bg-teal-600 hover:bg-teal-700 text-white text-sm px-6 py-2 rounded-full transition-colors"
      >
        再試行する
      </button>
    </div>
  );
}
