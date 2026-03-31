"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Trash2, ExternalLink, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

const PER_PAGE = 10;

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
  beginner:     "初級",
  intermediate: "中級",
  advanced:     "上級",
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending:  { label: "承認待ち", bg: "bg-yellow-50",  text: "text-yellow-700", dot: "bg-yellow-400" },
  approved: { label: "承認済み", bg: "bg-green-50",   text: "text-green-700",  dot: "bg-green-500"  },
  rejected: { label: "却下",     bg: "bg-red-50",     text: "text-red-600",    dot: "bg-red-400"    },
};

const FILTER_TABS: { value: StatusFilter; label: string; activeColor: string }[] = [
  { value: "all",      label: "すべて",   activeColor: "bg-gray-800 text-white" },
  { value: "pending",  label: "承認待ち", activeColor: "bg-yellow-500 text-white" },
  { value: "approved", label: "承認済み", activeColor: "bg-green-600 text-white" },
  { value: "rejected", label: "却下",     activeColor: "bg-red-500 text-white" },
];

type Toast = { id: number; message: string; type: "success" | "error" };

export default function AdminQuestions({ questions: initial }: { questions: Question[] }) {
  const [questions, setQuestions]       = useState(initial);
  const [filter, setFilter]             = useState<StatusFilter>("pending");
  const [page, setPage]                 = useState(1);
  const [loadingId, setLoadingId]       = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [toasts, setToasts]             = useState<Toast[]>([]);

  const filtered    = filter === "all" ? questions : questions.filter((q) => q.status === filter);
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  function changeFilter(f: StatusFilter) {
    setFilter(f);
    setPage(1);
    setConfirmDeleteId(null);
  }

  function addToast(message: string, type: "success" | "error") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }

  async function updateStatus(id: number, status: "approved" | "rejected") {
    setLoadingId(id);
    const res = await fetch(`/api/admin/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
      addToast(status === "approved" ? "✓ 承認しました" : "✓ 却下しました", "success");
      changeFilter(status);
    } else {
      addToast("操作に失敗しました", "error");
    }
    setLoadingId(null);
  }

  async function deleteQuestion(id: number) {
    setLoadingId(id);
    const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    if (res.ok) {
      setQuestions((prev) => {
        const next = prev.filter((q) => q.id !== id);
        // 削除後に現在ページが空になる場合は1ページ戻す
        const newFiltered = next.filter((q) => filter === "all" || q.status === filter);
        const newTotal = Math.max(1, Math.ceil(newFiltered.length / PER_PAGE));
        if (currentPage > newTotal) setPage(newTotal);
        return next;
      });
      addToast("🗑 削除しました", "success");
      setConfirmDeleteId(null);
    } else {
      addToast("削除に失敗しました", "error");
    }
    setLoadingId(null);
  }

  return (
    <div>
      {/* ── トースト通知 ── */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg pointer-events-auto transition-all ${
              t.type === "success"
                ? "bg-gray-900 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* ── フィルタータブ ── */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {FILTER_TABS.map((tab) => {
          const count =
            tab.value === "all"
              ? questions.length
              : questions.filter((q) => q.status === tab.value).length;
          const isActive = filter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => changeFilter(tab.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive ? tab.activeColor : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 ${isActive ? "opacity-80" : "opacity-60"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 件数 + ページ情報 ── */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
          <span>
            {filtered.length}件中
            {" "}{(currentPage - 1) * PER_PAGE + 1}〜{Math.min(currentPage * PER_PAGE, filtered.length)}件を表示
          </span>
          {totalPages > 1 && (
            <span>{currentPage} / {totalPages} ページ</span>
          )}
        </div>
      )}

      {/* ── 質問一覧 ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          該当する質問はありません
        </div>
      ) : (
        <div className="space-y-2.5">
          {paginated.map((q) => {
            const sc       = STATUS_CONFIG[q.status] ?? STATUS_CONFIG.pending;
            const isPending  = q.status === "pending";
            const isRejected = q.status === "rejected";
            const isLoading  = loadingId === q.id;
            const confirmDel = confirmDeleteId === q.id;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-xl border p-4 transition-all ${
                  isPending  ? "border-yellow-200 shadow-sm shadow-yellow-50" :
                  isRejected ? "border-red-100" :
                  "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* ステータスドット */}
                  <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />

                  <div className="flex-1 min-w-0">
                    {/* バッジ行 */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.text}`}>
                        {sc.label}
                      </span>
                      <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                        {q.category}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {LEVEL_LABELS[q.level] ?? q.level}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto shrink-0">
                        {new Date(q.createdAt).toLocaleDateString("ja-JP")}
                      </span>
                    </div>

                    {/* タイトル */}
                    <div className="flex items-start gap-1.5">
                      <Link
                        href={`/questions/${q.id}`}
                        target="_blank"
                        className="font-semibold text-gray-900 hover:text-amber-600 transition-colors line-clamp-1 flex-1"
                      >
                        {q.title}
                      </Link>
                      <ExternalLink size={13} className="shrink-0 mt-0.5 text-gray-300" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {q.content}
                    </p>

                    {/* ── アクションエリア ── */}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {/* 承認待ち → 承認 / 却下 */}
                      {isPending && (
                        <>
                          <button
                            onClick={() => updateStatus(q.id, "approved")}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
                          >
                            <CheckCircle size={13} />
                            {isLoading ? "処理中..." : "承認"}
                          </button>
                          <button
                            onClick={() => updateStatus(q.id, "rejected")}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
                          >
                            <XCircle size={13} />
                            {isLoading ? "処理中..." : "却下"}
                          </button>
                        </>
                      )}

                      {/* 承認済み → 却下に戻す */}
                      {q.status === "approved" && (
                        <button
                          onClick={() => updateStatus(q.id, "rejected")}
                          disabled={isLoading}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          <RotateCcw size={12} />
                          却下に戻す
                        </button>
                      )}

                      {/* 却下済み → 承認する / 削除 */}
                      {isRejected && !confirmDel && (
                        <>
                          <button
                            onClick={() => updateStatus(q.id, "approved")}
                            disabled={isLoading}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                          >
                            <RotateCcw size={12} />
                            承認する
                          </button>
                          <span className="text-gray-200">|</span>
                          <button
                            onClick={() => setConfirmDeleteId(q.id)}
                            disabled={isLoading}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={12} />
                            削除
                          </button>
                        </>
                      )}

                      {/* 削除確認 */}
                      {isRejected && confirmDel && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                          <span className="text-xs text-red-700 font-medium">本当に削除しますか？</span>
                          <button
                            onClick={() => deleteQuestion(q.id)}
                            disabled={isLoading}
                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded-md transition-colors disabled:opacity-50 font-medium"
                          >
                            {isLoading ? "削除中..." : "削除する"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={isLoading}
                            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            キャンセル
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ページネーション ── */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={15} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                p === currentPage
                  ? "bg-gray-800 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
