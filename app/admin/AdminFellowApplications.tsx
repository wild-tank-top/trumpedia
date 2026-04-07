"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, CheckCircle, XCircle, ChevronDown, ChevronUp,
  Clock, UserCheck, History,
} from "lucide-react";

type Application = {
  id: string;
  status: string;
  referrerNote: string | null;
  createdAt: string;
  applicant: { id: string; name: string | null; createdAt: string };
  referrer: { id: string; name: string | null };
};

const STATUS_META: Record<string, { label: string; badgeColor: string; borderColor: string; bgColor: string }> = {
  pending:           { label: "紹介者承認待ち", badgeColor: "bg-yellow-100 text-yellow-700", borderColor: "border-yellow-200", bgColor: "bg-yellow-50/40" },
  referrer_approved: { label: "最終確認待ち",   badgeColor: "bg-blue-100 text-blue-700",   borderColor: "border-blue-300",  bgColor: "bg-blue-50/40"   },
  admin_completed:   { label: "参加完了",       badgeColor: "bg-teal-100 text-teal-700",   borderColor: "border-gray-200",  bgColor: "bg-gray-50/30"   },
  rejected:          { label: "却下",           badgeColor: "bg-gray-100 text-gray-500",   borderColor: "border-gray-200",  bgColor: "bg-gray-50/30"   },
};

function Initials({ name }: { name: string | null }) {
  const ch = (name ?? "?")[0].toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
      {ch}
    </div>
  );
}

export default function AdminFellowApplications({ applications }: { applications: Application[] }) {
  const [showHistory, setShowHistory] = useState(false);

  const active   = applications.filter((a) => a.status === "referrer_approved" || a.status === "pending");
  const history  = applications.filter((a) => a.status === "admin_completed"   || a.status === "rejected");

  // referrer_approved を先頭に
  const sorted = [...active].sort((a, b) => {
    if (a.status === "referrer_approved" && b.status !== "referrer_approved") return -1;
    if (b.status === "referrer_approved" && a.status !== "referrer_approved") return  1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-2">
      {sorted.length === 0 && history.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400">
          <Users size={28} className="mx-auto mb-2 opacity-30" />
          現在、合流待機中の申請はありません
        </div>
      ) : (
        <>
          {sorted.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400 text-center">
              対応待ちの申請はありません
            </div>
          )}
          {sorted.map((app) => <ApplicationCard key={app.id} app={app} />)}

          {/* 履歴トグル */}
          {history.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowHistory((v) => !v)}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors px-1"
              >
                <History size={13} />
                {showHistory ? "履歴を閉じる" : `完了・却下済みを表示（${history.length}件）`}
                {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {showHistory && (
                <div className="mt-2 space-y-2">
                  {history.map((app) => <ApplicationCard key={app.id} app={app} readonly />)}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ApplicationCard({ app, readonly = false }: { app: Application; readonly?: boolean }) {
  const router    = useRouter();
  const [open, setOpen]       = useState(app.status === "referrer_approved");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState<"completed" | "rejected" | null>(null);

  const meta = STATUS_META[app.status] ?? STATUS_META.pending;
  const isActionable = app.status === "referrer_approved";

  async function handleAction(action: "complete" | "reject") {
    const msg = action === "complete"
      ? `${app.applicant.name ?? "このユーザー"} を Fellows に昇格しますか？`
      : "この申請を却下しますか？";
    if (!confirm(msg)) return;

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
        <CheckCircle size={15} /> {app.applicant.name} を Fellows に移行しました
      </div>
    );
  }
  if (done === "rejected") {
    return (
      <div className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
        <XCircle size={15} /> 申請を却下しました
      </div>
    );
  }

  return (
    <div className={`border rounded-xl overflow-hidden ${meta.borderColor} ${isActionable ? "shadow-sm" : ""}`}>
      {/* ヘッダー行 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors text-left ${meta.bgColor}`}
      >
        <Initials name={app.applicant.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-800 truncate">
              {app.applicant.name ?? "名無し"}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.badgeColor}`}>
              {meta.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            紹介: {app.referrer.name} · {new Date(app.createdAt).toLocaleDateString("ja-JP")}
          </p>
        </div>
        {/* アクション待ちインジケーター */}
        {isActionable && (
          <span className="shrink-0 flex items-center gap-1 text-xs text-blue-600 font-medium">
            <UserCheck size={13} /> 確認待ち
          </span>
        )}
        <span className="text-gray-300 shrink-0">
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>

      {/* 展開パネル */}
      {open && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4 bg-white">
          {/* 紹介者コメント */}
          {app.referrerNote ? (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                紹介者コメント（{app.referrer.name}）
              </p>
              <blockquote className="border-l-4 border-amber-300 bg-amber-50 rounded-r-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
                {app.referrerNote}
              </blockquote>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-400 italic">
              <Clock size={13} />
              紹介者のコメントはまだありません（承認待ち）
            </div>
          )}

          {/* 申請者登録日 */}
          <p className="text-xs text-gray-400">
            申請者登録日: {new Date(app.applicant.createdAt).toLocaleDateString("ja-JP")}
          </p>

          {/* アクションボタン */}
          {isActionable && !readonly && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleAction("complete")}
                disabled={loading}
                className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-5 py-2 rounded-full transition-colors disabled:opacity-50"
              >
                <CheckCircle size={14} />
                {loading ? "処理中..." : "Fellows へ移行"}
              </button>
              <button
                onClick={() => handleAction("reject")}
                disabled={loading}
                className="flex items-center gap-1.5 border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm px-4 py-2 rounded-full transition-colors disabled:opacity-50"
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
