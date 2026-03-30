"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

export default function SupplementForm({ questionId }: { questionId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/questions/${questionId}/supplements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setContent("");
        setOpen(false);
        router.refresh();
      } else {
        const json = await res.json().catch(() => ({}));
        setError((json as { error?: string }).error ?? "投稿に失敗しました");
      }
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 transition-colors"
      >
        <PlusCircle size={15} />
        補足を追加する
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        required
        placeholder="追加情報や補足を入力してください。回答者全員に通知されます。"
        className="w-full border border-teal-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setOpen(false); setError(""); }}
          className="flex-1 border border-gray-300 text-gray-600 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "投稿中..." : "補足を投稿する"}
        </button>
      </div>
    </form>
  );
}
