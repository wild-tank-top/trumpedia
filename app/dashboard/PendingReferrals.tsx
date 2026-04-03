"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, ChevronDown, ChevronUp, Send } from "lucide-react";

type Application = {
  id: string;
  status: string;
  applicant: { name: string | null; email: string | null; createdAt: string };
  createdAt: string;
};

export default function PendingReferrals({ applications }: { applications: Application[] }) {
  const router = useRouter();
  const pending = applications.filter((a) => a.status === "pending");

  if (pending.length === 0) return null;

  return (
    <div className="bg-white border border-amber-200 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <UserCheck size={18} className="text-amber-600" />
        <h2 className="text-base font-semibold text-gray-800">承認待ちの参加申請</h2>
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
          {pending.length}件
        </span>
      </div>
      <p className="text-sm text-gray-500">
        あなたの招待コードを使って参加申請があります。承認する際は、申請者の専門性・活動内容を入力してください。
      </p>
      <div className="space-y-3">
        {pending.map((app) => (
          <ReferralCard key={app.id} app={app} onAction={() => router.refresh()} />
        ))}
      </div>
    </div>
  );
}

function ReferralCard({
  app,
  onAction,
}: {
  app: Application;
  onAction: () => void;
}) {
  const [open, setOpen]     = useState(false);
  const [note, setNote]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [done, setDone]     = useState(false);

  async function handleApprove(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/fellow-applications/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "refer", note }),
    });

    if (res.ok) {
      setDone(true);
      onAction();
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "承認に失敗しました");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="border border-teal-200 bg-teal-50 rounded-xl px-4 py-3 text-sm text-teal-700">
        ✓ 承認しました。管理者の最終確認をお待ちください。
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div>
          <p className="text-sm font-medium text-gray-800">
            {app.applicant.name ?? "名無し"}
          </p>
          <p className="text-xs text-gray-400">
            {app.applicant.email} ·
            申請日 {new Date(app.createdAt).toLocaleDateString("ja-JP")}
          </p>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <form onSubmit={handleApprove} className="border-t border-gray-100 px-4 py-4 space-y-3 bg-gray-50/50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              申請者の専門性・活動内容 <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">
              例：〇〇オーケストラで10年間首席として活動。室内楽の指導経験も豊富。
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              minLength={10}
              required
              placeholder="申請者のトランペット演奏歴、所属、専門分野などを記入してください"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
            <p className="text-[11px] text-gray-400 mt-1">{note.length} 文字（10文字以上必須）</p>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || note.trim().length < 10}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors disabled:opacity-50"
            >
              <Send size={13} />
              {loading ? "送信中..." : "承認して管理者へ送る"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2"
            >
              閉じる
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
