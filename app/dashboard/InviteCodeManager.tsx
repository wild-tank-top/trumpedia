"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Copy, Check, Clock } from "lucide-react";

type Code = {
  id: string;
  code: string;
  expiresAt: string;
  usedAt: string | null;
  usedBy: { name: string | null; email: string | null } | null;
  application: { status: string } | null;
  createdAt: string;
};

export default function InviteCodeManager({ initialCodes }: { initialCodes: Code[] }) {
  const router  = useRouter();
  const [codes, setCodes]       = useState<Code[]>(initialCodes);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [copied, setCopied]     = useState<string | null>(null);

  const activeCodes = codes.filter(
    (c) => !c.usedAt && new Date(c.expiresAt) > new Date()
  );

  async function handleGenerate() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/invite-codes", { method: "POST" });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setCodes((prev) => [json.inviteCode, ...prev]);
      router.refresh();
    } else {
      setError(json.error ?? "コードの発行に失敗しました");
    }
    setLoading(false);
  }

  async function handleRevoke(id: string) {
    if (!confirm("このコードを取り消しますか？")) return;
    const res = await fetch(`/api/invite-codes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCodes((prev) => prev.filter((c) => c.id !== id));
    }
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  function statusLabel(c: Code): { text: string; color: string } {
    if (c.application?.status === "admin_completed")
      return { text: "参加完了", color: "text-teal-600 bg-teal-50" };
    if (c.application?.status === "referrer_approved")
      return { text: "管理者確認待ち", color: "text-blue-600 bg-blue-50" };
    if (c.application?.status === "pending")
      return { text: "紹介者承認待ち", color: "text-yellow-600 bg-yellow-50" };
    if (c.usedAt)
      return { text: "使用済み", color: "text-gray-500 bg-gray-100" };
    if (new Date(c.expiresAt) < new Date())
      return { text: "期限切れ", color: "text-gray-400 bg-gray-50" };
    return { text: "有効", color: "text-teal-700 bg-teal-50" };
  }

  const remainingSlots = 3 - activeCodes.length;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Fellows招待コード</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            有効期限24時間・使い切り・同時発行上限3つ
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || activeCodes.length >= 3}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          {loading ? "発行中..." : "コードを発行"}
        </button>
      </div>

      {/* 残り枠 */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < activeCodes.length ? "bg-teal-400" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400 -mt-2">
        残り {remainingSlots} 枠
      </p>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* コード一覧 */}
      {codes.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          まだコードを発行していません
        </p>
      ) : (
        <div className="space-y-2">
          {codes.map((c) => {
            const s = statusLabel(c);
            const isActive = !c.usedAt && new Date(c.expiresAt) > new Date();
            const expiresIn = isActive
              ? Math.max(0, Math.floor((new Date(c.expiresAt).getTime() - Date.now()) / 3600000))
              : null;

            return (
              <div
                key={c.id}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  isActive ? "border-teal-200 bg-teal-50/40" : "border-gray-100 bg-gray-50/50"
                }`}
              >
                {/* コード */}
                <span className={`font-mono text-base font-bold tracking-widest flex-1 ${isActive ? "text-gray-800" : "text-gray-400"}`}>
                  {c.code}
                </span>

                {/* ステータスバッジ */}
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${s.color}`}>
                  {s.text}
                </span>

                {/* 使用者 */}
                {c.usedBy && (
                  <span className="text-xs text-gray-500 truncate max-w-[100px]">
                    {c.usedBy.name ?? c.usedBy.email}
                  </span>
                )}

                {/* 有効期限 */}
                {expiresIn !== null && (
                  <span className="text-xs text-gray-400 flex items-center gap-0.5 shrink-0">
                    <Clock size={11} />
                    {expiresIn}h
                  </span>
                )}

                {/* アクション */}
                {isActive && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(c.code)}
                      className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
                      title="コードをコピー"
                    >
                      {copied === c.code ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => handleRevoke(c.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="取り消し"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
