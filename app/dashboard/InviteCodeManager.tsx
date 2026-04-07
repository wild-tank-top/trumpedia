"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Copy, Check, Clock, MessageSquarePlus } from "lucide-react";

function buildInviteText(code: string) {
  return `【Trumpedia開発者からのご招待】

『Trumpedia』は、トランペット奏者の知見/思考/哲学を、
時間・場所の制約を超えて繋ぐQ&Aプラットフォームです。

日本中にいるトランペット吹きの中で、実際にあなたに会える人は少なく、あなたの優れた知見が一時の会話で消えていってしまうことが本当に惜しい。
だからこのサイトを作りました。

Fellowとして参加することで——

🎁 現場で磨き上げた知恵を「消えない道標」として、全国の奏者へ届けられます。
📖 回答を重ねるだけで、あなたの音楽哲学が可視化され、名刺代わりのポートフォリオになります。
🤖 蓄積された思考をもとにした「AIクローン」プロジェクトも構想中です。

ぜひ一緒に、日本のトランペット界をより自由でクリエイティブなステージへ。

🔑 招待コード：${code}
https://trumpedia.vercel.app/register`;
}

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
  const [codes, setCodes]         = useState<Code[]>(initialCodes);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [copied, setCopied]       = useState<string | null>(null);
  const [toastVisible, setToast]  = useState(false);

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
    navigator.clipboard.writeText(buildInviteText(code));
    setCopied(code);
    setToast(true);
    setTimeout(() => setCopied(null), 2500);
    setTimeout(() => setToast(false), 4000);
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
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 relative">

      {/* コピー完了トースト */}
      <div
        className={[
          "absolute left-1/2 -translate-x-1/2 top-3 z-10",
          "flex items-center gap-2 px-4 py-2.5 rounded-full shadow-md",
          "bg-gray-900/90 backdrop-blur-sm text-white text-xs font-medium whitespace-nowrap",
          "transition-all duration-300",
          toastVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none",
        ].join(" ")}
      >
        <MessageSquarePlus size={13} className="text-teal-400 shrink-0" />
        招待メッセージをコピーしました。このまま送付ください
      </div>

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
                      title="招待メッセージをコピー"
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
