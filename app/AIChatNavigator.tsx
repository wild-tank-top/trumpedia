"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, X, Search } from "lucide-react";
import TextThumbnail from "./components/TextThumbnail";
import { LEVEL_LABELS, LEVEL_STYLES, DEFAULT_LEVEL_STYLE } from "@/lib/levelConfig";

type Question = {
  id: number;
  title: string;
  content: string;
  category: string;
  level: string;
  createdAt: Date | string;
  _count: { answers: number };
};

type Props = { questions: Question[] };

// ── 類義語グループ ────────────────────────────────────────────────────
// いずれかの語がキーワードにマッチしたとき、グループ全体で質問を検索する
const SYNONYM_GROUPS: string[][] = [
  // 高音域
  [
    "高音", "高音域", "高い音", "上の音",
    "ハイトーン", "ハイノート", "ハイC", "ハイBb", "ハイB", "ハイF",
    "ダブルハイ", "フラジオ", "ハイ",
  ],
  // 低音域
  [
    "低音", "低音域", "低い音", "下の音",
    "ローノート", "ロートーン", "ペダル", "ペダルトーン",
    "ロー",
  ],
];

/**
 * AIが抽出したキーワードを類義語グループで展開する。
 * 例: ["ハイトーン"] → ["ハイトーン","高音","高音域","ハイC","フラジオ",...]
 */
function expandWithSynonyms(keywords: string[]): string[] {
  const expanded = new Set(keywords);
  for (const kw of keywords) {
    for (const group of SYNONYM_GROUPS) {
      const hit = group.some((term) => kw.includes(term) || term.includes(kw));
      if (hit) {
        group.forEach((term) => expanded.add(term));
        break;
      }
    }
  }
  return Array.from(expanded);
}

export default function AIChatNavigator({ questions }: Props) {
  const [open,     setOpen]     = useState(false);
  const [message,  setMessage]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [filtered, setFiltered] = useState<Question[]>([]);

  // ── キーワード抽出 & フィルタリング ──────────────────
  async function handleSearch() {
    if (!message.trim()) return;
    setLoading(true);
    setError("");
    setKeywords([]);
    setFiltered([]);

    try {
      const res  = await fetch("/api/ai/chat-navigate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message }),
      });
      const json = await res.json().catch(() => ({})) as { keywords?: string[]; error?: string; detail?: string };

      if (!res.ok) {
        // ブラウザコンソールに詳細を出力（デバッグ用）
        console.error("[AIChatNavigator] API error", res.status, "error:", json.error, "detail:", json.detail);
        if (res.status === 503) {
          setError("AI機能は現在メンテナンス中です。通常の検索をご利用ください。");
        } else {
          setError(json.error ?? `AI処理に失敗しました (HTTP ${res.status})`);
        }
        return;
      }

      const kws = json.keywords ?? [];
      setKeywords(kws);

      // 類義語グループで展開してからマッチング
      const expandedKws = expandWithSynonyms(kws);

      const matched = questions.filter((q) => {
        const text = q.title + " " + q.content + " " + q.category;
        return expandedKws.some((kw) => text.includes(kw));
      });
      setFiltered(matched);
    } catch (err) {
      console.error("[AIChatNavigator] fetch error:", err);
      setError("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setMessage("");
    setKeywords([]);
    setFiltered([]);
    setError("");
  }

  const hasResult = keywords.length > 0;

  return (
    <div className="mb-6">
      {/* ── 閉じているとき：ボタン ──────────────────────── */}
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-700 text-sm font-medium py-3 rounded-xl transition-colors"
        >
          <Sparkles size={16} />
          AIに相談して質問を探す
        </button>
      ) : (
        /* ── 開いているとき：チャット窓 ──────────────── */
        <div className="border border-teal-200 bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-4 py-3 bg-teal-600">
            <div className="flex items-center gap-2 text-white">
              <Sparkles size={16} />
              <span className="text-sm font-semibold">AIナビゲーター</span>
            </div>
            <button
              onClick={() => { setOpen(false); handleClear(); }}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="閉じる"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <p className="text-xs text-gray-500">
              悩みや困っていることを入力すると、関連する質問を探します。
            </p>

            {/* 入力エリア */}
            <div className="flex gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="例：高音がうまく出ません。音が詰まってしまいます。"
                rows={2}
                maxLength={300}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
              />
              <button
                onClick={handleSearch}
                disabled={loading || !message.trim()}
                className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                ) : (
                  <Search size={16} />
                )}
              </button>
            </div>

            {/* エラー */}
            {error && (
              <p className="text-red-500 text-xs">{error}</p>
            )}

            {/* キーワード表示 */}
            {hasResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">抽出キーワード：</span>
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-xs bg-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                  <button
                    onClick={handleClear}
                    className="text-xs text-gray-400 hover:text-gray-600 ml-auto"
                  >
                    クリア
                  </button>
                </div>

                {/* 検索結果 */}
                {filtered.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    <p>関連する質問が見つかりませんでした。</p>
                    <Link
                      href="/questions/new"
                      className="inline-block mt-2 text-xs text-teal-600 hover:underline"
                    >
                      新しく質問する →
                    </Link>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-500">
                      {filtered.length}件の質問が見つかりました
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {filtered.slice(0, 6).map((q) => {
                        const s = LEVEL_STYLES[q.level] ?? DEFAULT_LEVEL_STYLE;
                        return (
                          <Link
                            key={q.id}
                            href={`/questions/${q.id}`}
                            className={`block bg-white rounded-xl border shadow-sm ${s.cardBorder} ${s.cardHover} transition-all overflow-hidden`}
                          >
                            <div className={`h-1 w-full ${s.bar}`} />
                            <TextThumbnail title={q.title} level={q.level} />
                            <div className="p-3">
                              <div className="flex flex-wrap gap-1 mb-1.5">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                  {q.category}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${s.badge}`}>
                                  {LEVEL_LABELS[q.level] ?? q.level}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                                {q.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                回答 {q._count.answers}件
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    {filtered.length > 6 && (
                      <p className="text-xs text-center text-gray-400">
                        他 {filtered.length - 6} 件は検索ワードで絞り込んでください
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
