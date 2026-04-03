"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Clock, CheckCircle, Send } from "lucide-react";

type Application = {
  id: string;
  status: string;
  referrer: { name: string | null };
  createdAt: string;
} | null;

export default function GuestDashboard({ application }: { application: Application }) {
  const router = useRouter();
  const [code, setCode]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/fellow-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      setSuccess(true);
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "申請に失敗しました");
    }
    setLoading(false);
  }

  // ── 申請済み: ステータス表示 ──────────────────────────
  if (application) {
    const statusMap: Record<string, { label: string; icon: React.ReactNode; desc: string; color: string }> = {
      pending: {
        label: "承認待ち（紹介者）",
        icon: <Clock size={18} className="text-yellow-500" />,
        desc: `${application.referrer.name ?? "紹介者"} さんの承認を待っています。`,
        color: "border-yellow-200 bg-yellow-50",
      },
      referrer_approved: {
        label: "最終確認待ち（管理者）",
        icon: <Clock size={18} className="text-blue-500" />,
        desc: "紹介者が承認しました。管理者の最終確認をお待ちください。",
        color: "border-blue-200 bg-blue-50",
      },
      admin_completed: {
        label: "参加完了",
        icon: <CheckCircle size={18} className="text-teal-500" />,
        desc: "Fellowsネットワークへの参加が完了しました。",
        color: "border-teal-200 bg-teal-50",
      },
      rejected: {
        label: "見送り",
        icon: <Clock size={18} className="text-gray-400" />,
        desc: "今回は見送りとなりました。",
        color: "border-gray-200 bg-gray-50",
      },
    };

    const s = statusMap[application.status] ?? statusMap.pending;

    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-teal-600" />
          <h2 className="text-base font-semibold text-gray-800">Fellowsネットワーク参加申請</h2>
        </div>
        <div className={`flex items-start gap-3 border rounded-xl p-4 ${s.color}`}>
          <span className="mt-0.5">{s.icon}</span>
          <div>
            <p className="font-semibold text-sm text-gray-800">{s.label}</p>
            <p className="text-sm text-gray-600 mt-0.5">{s.desc}</p>
            <p className="text-xs text-gray-400 mt-1.5">
              申請日: {new Date(application.createdAt).toLocaleDateString("ja-JP")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── 未申請: 招待コード入力フォーム ───────────────────
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Users size={18} className="text-teal-600" />
        <h2 className="text-base font-semibold text-gray-800">Fellowsネットワークへの参加</h2>
      </div>

      <p className="text-sm text-gray-500 leading-relaxed">
        Trumpediaの Fellows は、既存メンバーによる紹介と承認を経て参加するプロフェッショナルコミュニティです。
        Fellows から招待コードを受け取った場合は以下から申請できます。
      </p>

      {success ? (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle size={18} className="text-teal-500 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-teal-800">申請を受け付けました</p>
            <p className="text-sm text-teal-600 mt-0.5">紹介者の承認をお待ちください。</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleApply} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fellows招待コード
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="例：TRP8K2XZ"
              maxLength={12}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-5 py-2 rounded-full transition-colors disabled:opacity-50"
          >
            <Send size={14} />
            {loading ? "申請中..." : "参加申請する"}
          </button>
        </form>
      )}
    </div>
  );
}
