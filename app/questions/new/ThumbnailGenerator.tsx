"use client";

import { useState } from "react";

type Props = {
  /** 親フォームのタイトル・カテゴリを受け取り、プロンプトに使用 */
  getFormValues: () => { title: string; category: string };
  /** 選択された画像URLを親に通知 */
  onSelect: (url: string | null) => void;
};

export default function ThumbnailGenerator({ getFormValues, onSelect }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    const { title, category } = getFormValues();
    if (!title.trim()) {
      setError("先にタイトルを入力してください");
      return;
    }

    setLoading(true);
    setError("");
    // 再生成時は選択解除
    setSelected(false);
    onSelect(null);

    try {
      const res = await fetch("/api/generate-thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "生成に失敗しました");
        return;
      }

      setUrl(json.url);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  function handleSelect() {
    if (!url) return;
    const next = !selected;
    setSelected(next);
    onSelect(next ? url : null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-2 border border-teal-300 text-teal-700 text-sm px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
              生成中...
            </>
          ) : (
            <>
              {/* sparkle icon */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              {url ? "再生成" : "AIサムネを生成"}
            </>
          )}
        </button>

        {url && !loading && (
          <span className="text-xs text-gray-400">
            {selected ? "✓ 選択中（投稿に含まれます）" : "画像を選択して投稿に含めることができます"}
          </span>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}

      {/* プレビュー */}
      {loading && (
        <div className="w-full aspect-square max-w-xs rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-400">
          <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
          </svg>
          <p className="text-sm">AIが画像を生成しています...</p>
          <p className="text-xs">（10〜30秒ほどかかります）</p>
        </div>
      )}

      {url && !loading && (
        <button
          type="button"
          onClick={handleSelect}
          className={`relative block w-full max-w-xs rounded-xl overflow-hidden border-2 transition-all ${
            selected
              ? "border-teal-500 ring-2 ring-teal-300"
              : "border-gray-200 hover:border-teal-300"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="生成されたサムネイル" className="w-full aspect-square object-cover" />
          {selected && (
            <div className="absolute top-2 right-2 bg-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-xs py-1.5 text-center">
            {selected ? "選択中（クリックで解除）" : "クリックして選択"}
          </div>
        </button>
      )}
    </div>
  );
}
