"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "削除に失敗しました");
        return;
      }
      await signOut({ callbackUrl: "/" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full border border-red-200 text-red-500 hover:bg-red-50 py-2 rounded-lg text-sm transition-colors"
      >
        アカウントを削除する（退会）
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">アカウントを削除しますか？</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p>この操作は取り消せません。削除すると：</p>
              <ul className="list-disc list-inside space-y-1 text-gray-500">
                <li>あなたの回答はすべて削除されます</li>
                <li>投稿した質問はサイトに残ります</li>
                <li>プロフィールとアカウント情報が削除されます</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                確認のため <span className="font-bold text-red-500">「削除する」</span> と入力してください
              </p>
              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="削除する"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setOpen(false); setConfirm(""); setError(""); }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirm !== "削除する" || loading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
              >
                {loading ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
