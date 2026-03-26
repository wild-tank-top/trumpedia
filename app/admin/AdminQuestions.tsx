"use client";

import { useState } from "react";
import Link from "next/link";

type Question = {
  id: number;
  title: string;
  category: string;
  level: string;
  content: string;
  status: string;
  createdAt: Date;
};

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:  { label: "承認待ち", color: "bg-yellow-100 text-yellow-700" },
  approved: { label: "承認済み", color: "bg-green-100 text-green-700" },
  rejected: { label: "却下",     color: "bg-red-100 text-red-600" },
};

const FILTER_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all",      label: "すべて" },
  { value: "pending",  label: "承認待ち" },
  { value: "approved", label: "承認済み" },
  { value: "rejected", label: "却下" },
];

export default function AdminQuestions({ questions: initial }: { questions: Question[] }) {
  const [questions, setQuestions] = useState(initial);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [errorId, setErrorId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filtered = filter === "all" ? questions : questions.filter((q) => q.status === filter);

  async function updateStatus(id: number, status: "approved" | "rejected") {
    setLoadingId(id);
    setErrorId(null);
    setSuccessMessage(null);

    const res = await fetch(`/api/admin/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
      setSuccessMessage(status === "approved" ? "承認しました" : "却下しました");
      setFilter(status);
    } else {
      setErrorId(id);
    }
    setLoadingId(null);
  }

  return (
    <div>
      {/* 成功メッセージ */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2 mb-4">
          {successMessage}
        </div>
      )}

      {/* フィルタータブ */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTER_TABS.map((tab) => {
          const count =
            tab.value === "all"
              ? questions.length
              : questions.filter((q) => q.status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === tab.value
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* 質問一覧 */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
          該当する質問はありません
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => {
            const statusCfg = STATUS_CONFIG[q.status] ?? STATUS_CONFIG.pending;
            const isPending = q.status === "pending";
            return (
              <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* バッジ行 */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                        {q.category}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {LEVEL_LABELS[q.level] ?? q.level}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(q.createdAt).toLocaleDateString("ja-JP")}
                      </span>
                    </div>

                    {/* タイトル */}
                    <Link
                      href={`/questions/${q.id}`}
                      target="_blank"
                      className="font-semibold text-gray-900 hover:text-amber-600 block truncate"
                    >
                      {q.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{q.content}</p>

                    {/* エラー表示 */}
                    {errorId === q.id && (
                      <p className="text-xs text-red-500 mt-1">操作に失敗しました。再試行してください。</p>
                    )}
                  </div>

                  {/* アクションボタン（pendingのみ表示） */}
                  {isPending && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => updateStatus(q.id, "approved")}
                        disabled={loadingId === q.id}
                        className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {loadingId === q.id ? "処理中..." : "承認"}
                      </button>
                      <button
                        onClick={() => updateStatus(q.id, "rejected")}
                        disabled={loadingId === q.id}
                        className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {loadingId === q.id ? "処理中..." : "却下"}
                      </button>
                    </div>
                  )}

                  {/* 承認済み → 却下に戻す */}
                  {q.status === "approved" && (
                    <button
                      onClick={() => updateStatus(q.id, "rejected")}
                      disabled={loadingId === q.id}
                      className="text-xs text-gray-400 hover:text-red-500 shrink-0 transition-colors disabled:opacity-50"
                    >
                      却下に戻す
                    </button>
                  )}

                  {/* 却下済み → 承認 */}
                  {q.status === "rejected" && (
                    <button
                      onClick={() => updateStatus(q.id, "approved")}
                      disabled={loadingId === q.id}
                      className="text-xs text-gray-400 hover:text-green-600 shrink-0 transition-colors disabled:opacity-50"
                    >
                      承認する
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
