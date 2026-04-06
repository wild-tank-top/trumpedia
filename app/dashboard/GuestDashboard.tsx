"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, Send } from "lucide-react";

type Application = {
  id: string;
  status: string;
  referrer: { name: string | null };
  createdAt: string;
} | null;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:           { label: "紹介者の承認待ち",     color: "text-yellow-600" },
  referrer_approved: { label: "管理者の最終確認待ち", color: "text-blue-600"   },
  rejected:          { label: "今回は見送りとなりました", color: "text-gray-400" },
};

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

  // 申請済み: コンパクトなステータス表示
  if (application) {
    const s = STATUS_MAP[application.status];
    return (
      <div className="flex items-center gap-2 px-1 py-2 text-xs text-gray-400">
        {application.status === "rejected"
          ? <Clock size={13} className="shrink-0" />
          : <CheckCircle size={13} className="shrink-0 text-teal-400" />}
        <span>Fellows招待コード申請中 —</span>
        <span className={`font-medium ${s?.color ?? "text-gray-400"}`}>{s?.label}</span>
      </div>
    );
  }

  // 未申請: ミニマルなフォーム
  if (success) {
    return (
      <p className="text-xs text-teal-600 px-1 py-2">
        <CheckCircle size={13} className="inline mr-1" />
        申請を受け付けました。紹介者の承認をお待ちください。
      </p>
    );
  }

  return (
    <form onSubmit={handleApply} className="space-y-2">
      <label className="block text-xs font-medium text-gray-400">
        Fellows 招待コード
      </label>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="例：TRP8K2XZ"
          maxLength={12}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-40 shrink-0"
        >
          <Send size={13} />
          {loading ? "…" : "申請"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
