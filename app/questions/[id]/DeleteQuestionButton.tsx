"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteQuestionButton({ questionId }: { questionId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm("この質問を削除しますか？\n関連する回答もすべて削除されます。この操作は取り消せません。")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/questions/${questionId}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error ?? "削除に失敗しました");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors disabled:opacity-40"
    >
      <Trash2 size={14} />
      {loading ? "削除中..." : "質問を削除"}
    </button>
  );
}
