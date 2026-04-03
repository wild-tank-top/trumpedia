"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";

type Application = {
  id: string;
  status: string;
  referrerNote: string | null;
  createdAt: string;
  applicant: { id: string; name: string | null; email: string | null; createdAt: string };
  referrer: { id: string; name: string | null };
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:           { label: "紹介者承認待ち", color: "bg-yellow-100 text-yellow-700" },
  referrer_approved: { label: "最終確認待ち",   color: "bg-blue-100 text-blue-700" },
  admin_completed:   { label: "参加完了",       color: "bg-teal-100 text-teal-700" },
  rejected:          { label: "却下",           color: "bg-gray-100 text-gray-500" },
};

export default function AdminFellowApplications({
  applications,
}: {
  applications: Application[];
}) {
  const waitingCount = applications.filter((a) => a.status === "referrer_approved").length;

  return (
    <div className="space-y-3">
      {applications.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400">
          <Users size={28} className="mx-auto mb-2 opacity-30" />
          現在、合流待機中の申請はありません
        </div>
      ) : (
        applications.map((app) => (
          <ApplicationCard key={app.id} app={app} />
        ))
      )}
    </div>
  );
}

function ApplicationCard({ app }: { app: Application }) {
  const router  = useRouter();
  const [open, setOpen]     = useState(app.status === "referrer_approved");
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState<"completed" | "rejected" | null>(null);

  const s = STATUS_LABELS[app.status] ?? STATUS_LABELS.pending;

  async function handleAction(action: "complete" | "reject") {
    if (action === "complete" && !confirm(`${app.applicant.name ?? "このユーザー"} を Fellows に昇格しますか？`)) return;
    if (action === "reject"  && !confirm("この申請を却下しますか？")) return;

    setLoading(true);
    const res = await fetch(`/api/fellow-applications/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (res.ok) {
      setDone(action === "complete" ? "completed" : "rejected");
      router.refresh();
    }
    setLoading(false);
  }

  if (done === "completed") {
    return (
      <div className="border border-teal-200 bg-teal-50 rounded-xl px-4 py-3 text-sm text-teal-700 flex items-center gap-2">
        <CheckCircle size={15} />
        {app.applicant.name} を Fellows に移行しました
      </div>
    );
  }
  if (done === "rejected") {
    return (
      <div className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
        <XCircle size={15} />
        申請を却下しました
      </div>
    );
  }

  return (
    <div className={`border rounded-xl overflow-hidden ${
      app.status === "referrer_approved" ? "border-blue-200" : "border-gray-200"
    }`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.color}`}>
            {s.label}
          </span>
          <div>
            <p className="text-sm font-medium text-gray-800">
              {app.applicant.name ?? "名無し"}
              <span className="text-xs text-gray-400 font-normal ml-2">{app.applicant.email}</span>
            </p>
            <p className="text-xs text-gray-400">
              紹介者: {app.referrer.name} ·
              申請日: {new Date(app.createdAt).toLocaleDateString("ja-JP")}
            </p>
          </div>
        </div>
        {open ? <ChevronUp size={15} className="text-gray-400 shrink-0" /> : <ChevronDown size={15} className="text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4 bg-gray-50/30">
          {/* 紹介者コメント */}
          {app.referrerNote ? (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                紹介者からのコメント
              </p>
              <blockquote className="border-l-4 border-amber-300 bg-amber-50 rounded-r-lg px-4 py-3 text-sm text-gray-700 leading-relaxed">
                {app.referrerNote}
              </blockquote>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">紹介者のコメントはまだありません（承認待ち）</p>
          )}

          {/* 申請者情報 */}
          <div className="text-xs text-gray-400 space-y-0.5">
            <p>登録日: {new Date(app.applicant.createdAt).toLocaleDateString("ja-JP")}</p>
          </div>

          {/* アクションボタン（管理者確認待ちの場合のみ） */}
          {app.status === "referrer_approved" && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleAction("complete")}
                disabled={loading}
                className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors disabled:opacity-50"
              >
                <CheckCircle size={14} />
                {loading ? "処理中..." : "Fellows への移行を完了"}
              </button>
              <button
                onClick={() => handleAction("reject")}
                disabled={loading}
                className="flex items-center gap-1.5 border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm px-3 py-2 rounded-full transition-colors disabled:opacity-50"
              >
                <XCircle size={14} />
                却下
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
