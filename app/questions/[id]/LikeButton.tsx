"use client";

import { useState } from "react";

type Props = {
  answerId: number;
  initialCount: number;
  initialLiked: boolean;
  /** 未ログインの場合は false を渡す */
  isLoggedIn: boolean;
};

export default function LikeButton({
  answerId,
  initialCount,
  initialLiked,
  isLoggedIn,
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    // 未ログイン・二重クリックを防止
    if (!isLoggedIn || loading) return;

    setLoading(true);
    setError(null);

    // ── 楽観的更新（レスポンスを待たずに即 UI 更新）──────
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => (nextLiked ? c + 1 : c - 1));

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerId }),
      });

      if (res.ok) {
        const json: { liked: boolean; count: number } = await res.json();
        // サーバーの値で確定（楽観的更新との差分を修正）
        setLiked(json.liked);
        setCount(json.count);
      } else {
        // 失敗時は元の状態に戻す
        setLiked(liked);
        setCount((c) => (nextLiked ? c - 1 : c + 1));

        const json = await res.json().catch(() => ({}));
        setError((json as { error?: string }).error ?? "エラーが発生しました");
      }
    } catch {
      // ネットワークエラーなどでも元に戻す
      setLiked(liked);
      setCount((c) => (nextLiked ? c - 1 : c + 1));
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={toggle}
        disabled={loading || !isLoggedIn}
        aria-label={liked ? "いいねを取り消す" : "いいね"}
        title={
          !isLoggedIn
            ? "ログインするといいねできます"
            : liked
            ? "いいねを取り消す"
            : "いいね"
        }
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all
          disabled:cursor-not-allowed
          ${
            liked
              ? "border-teal-300 bg-teal-50 text-teal-700"
              : isLoggedIn
              ? "border-gray-200 bg-white text-gray-500 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600"
              : "border-gray-100 bg-white text-gray-400"
          }
          ${loading ? "opacity-60" : ""}
        `}
      >
        {/* サムズアップアイコン */}
        <svg
          className={`w-3.5 h-3.5 transition-colors ${
            liked ? "fill-teal-600 stroke-teal-600" : "fill-none stroke-current"
          }`}
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          />
        </svg>

        {/* ローディング中はスピナー */}
        {loading ? (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
            />
          </svg>
        ) : (
          <span className="font-medium tabular-nums">{count}</span>
        )}
      </button>

      {/* エラー表示 */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
