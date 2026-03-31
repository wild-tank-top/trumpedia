"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CATEGORIES } from "@/lib/constants";
import { useEffect } from "react";
import { Sparkles, ImageIcon, ChevronDown } from "lucide-react";
import ThumbnailPicker from "@/app/components/ThumbnailPicker";

type FormData = {
  title: string;
  category: string;
  level: string;
  content: string;
  thumbnail: string;
};

const LEVELS = [
  { value: "beginner",     label: "初級" },
  { value: "intermediate", label: "中級" },
  { value: "advanced",     label: "上級" },
];

export default function NewQuestionPage() {
  const router   = useRouter();
  const { status } = useSession();
  const formRef  = useRef<HTMLFormElement>(null);

  // ── フォーム状態（title/content は AI で書き換えるため controlled） ──
  const [title,   setTitle]   = useState("");
  const [content, setContent] = useState("");

  // ── 投稿フロー ────────────────────────────────────────
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [showModal,   setShowModal]   = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);
  const [thumbnail,   setThumbnail]   = useState("");
  const [showPicker,  setShowPicker]  = useState(false);

  // ── AI 言語化サポーター ───────────────────────────────
  const [aiLoading,    setAiLoading]    = useState(false);
  const [aiError,      setAiError]      = useState("");
  const [wasPolished,  setWasPolished]  = useState(false);
  const [prevTitle,    setPrevTitle]    = useState("");
  const [prevContent,  setPrevContent]  = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") return null;

  // ── AI リライト ───────────────────────────────────────
  async function handlePolish() {
    setAiLoading(true);
    setAiError("");

    // select は uncontrolled のままなので formRef から読む
    const form     = formRef.current!;
    const category = (form.elements.namedItem("category") as HTMLSelectElement).value;
    const level    = (form.elements.namedItem("level")    as HTMLSelectElement).value;

    try {
      const res = await fetch("/api/ai/polish-question", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title, content, category, level }),
      });
      const json = await res.json().catch(() => ({})) as { title?: string; content?: string; error?: string; detail?: string };
      if (!res.ok) console.error("[polish-question] API error", res.status, json);

      if (res.ok && json.title && json.content) {
        // 元の値を保存してから上書き
        setPrevTitle(title);
        setPrevContent(content);
        setTitle(json.title);
        setContent(json.content);
        setWasPolished(true);
      } else {
        const errMsg = res.status === 503
          ? "AI機能は現在メンテナンス中です。しばらくしてからお試しください。"
          : ((json as { error?: string }).error ?? "AI処理に失敗しました");
        setAiError(errMsg);
      }
    } catch {
      setAiError("通信エラーが発生しました");
    } finally {
      setAiLoading(false);
    }
  }

  function handleUndoPolish() {
    setTitle(prevTitle);
    setContent(prevContent);
    setWasPolished(false);
    setAiError("");
  }

  // ── 確認モーダルを開く ────────────────────────────────
  function handlePrepare(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form     = e.currentTarget;
    const category = (form.elements.namedItem("category") as HTMLSelectElement).value;
    const level    = (form.elements.namedItem("level")    as HTMLSelectElement).value;
    setPendingData({ title, content, category, level, thumbnail });
    setError("");
    setShowModal(true);
  }

  // ── 投稿実行 ──────────────────────────────────────────
  async function doSubmit() {
    if (!pendingData) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/questions", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(pendingData),
      });

      if (res.ok) {
        const question = await res.json() as { id: number };
        router.push(`/questions/${question.id}`);
      } else {
        const json = await res.json().catch(() => ({})) as { error?: string };
        setError(json.error ?? "エラーが発生しました");
        setLoading(false);
      }
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">質問を投稿する</h1>
      <p className="text-sm text-gray-500 mb-8">
        疑問・悩みをできるだけ具体的に書くと、より良い回答が集まります。
      </p>

      <form ref={formRef} onSubmit={handlePrepare} className="space-y-6">
        {/* タイトル（controlled） */}
        <Field label="タイトル" required hint="質問文そのものを書いてください（10文字以上推奨）">
          <input
            name="title"
            type="text"
            required
            minLength={10}
            value={title}
            onChange={(e) => { setTitle(e.target.value); setWasPolished(false); }}
            placeholder="例：バテない吹き方はありますか？"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="カテゴリ" required>
            <select
              name="category"
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="">選択してください</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="レベル" required>
            <select
              name="level"
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="">選択してください</option>
              {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </Field>
        </div>

        {/* 詳細（controlled） */}
        <Field label="詳細・補足" required hint="質問の意図や背景、補足情報を書いてください">
          <textarea
            name="content"
            required
            rows={5}
            value={content}
            onChange={(e) => { setContent(e.target.value); setWasPolished(false); }}
            placeholder={`例：\n・トランペット歴3年です。高音域になるとすぐにバテてしまいます。\n・スタンプのエチュードに取り組んでいますが、正しいやり方が分かりません。`}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
          />
        </Field>

        {/* ── アイキャッチ画像 ─────────────────────────── */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPicker((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ImageIcon size={15} className="text-gray-400" />
              アイキャッチ画像（任意）
              {thumbnail && (
                <span className="text-[11px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-normal">
                  選択済み
                </span>
              )}
            </div>
            <ChevronDown
              size={15}
              className={`text-gray-400 transition-transform ${showPicker ? "rotate-180" : ""}`}
            />
          </button>
          {showPicker && (
            <div className="p-4">
              <ThumbnailPicker
                value={thumbnail}
                onChange={setThumbnail}
                previewTitle={title}
              />
            </div>
          )}
        </div>

        {/* ── AI 言語化サポーター ───────────────────────── */}
        <div className="border border-teal-100 bg-teal-50 rounded-xl p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-teal-800 flex items-center gap-1.5">
                <Sparkles size={15} />
                AI言語化サポーター
              </p>
              <p className="text-xs text-teal-600 mt-0.5">
                入力した内容をプロ向けの丁寧な質問文に整えます
              </p>
            </div>
            <div className="flex items-center gap-2">
              {wasPolished && (
                <button
                  type="button"
                  onClick={handleUndoPolish}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  元に戻す
                </button>
              )}
              <button
                type="button"
                onClick={handlePolish}
                disabled={aiLoading || (!title && !content)}
                className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium px-4 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                    </svg>
                    整えています…
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    {wasPolished ? "再度整える" : "AIで文章を整える"}
                  </>
                )}
              </button>
            </div>
          </div>

          {wasPolished && !aiError && (
            <p className="text-xs text-teal-700 mt-2 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              AIが文章を整えました。内容を確認して必要に応じて編集してください。
            </p>
          )}
          {aiError && (
            <p className="text-xs text-red-600 mt-2">{aiError}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-gray-300 text-sm text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm py-2.5 rounded-lg font-medium transition-colors"
          >
            内容を確認する
          </button>
        </div>
      </form>

      {/* 確認モーダル */}
      {showModal && pendingData && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold text-gray-900 mb-1">投稿を確認</h2>
            <p className="text-sm text-gray-500 mb-4">この内容で質問を投稿しますか？</p>

            <div className="bg-gray-50 rounded-lg p-4 mb-5 space-y-2">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">{pendingData.title}</p>
              <p className="text-xs text-gray-400">
                {pendingData.category}　／　{LEVELS.find(l => l.value === pendingData.level)?.label ?? pendingData.level}
              </p>
              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{pendingData.content}</p>
              {pendingData.thumbnail ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden mt-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pendingData.thumbnail} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-bold line-clamp-2 drop-shadow">
                    {pendingData.title}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                  </svg>
                  サムネイルは自動で割り当てられます
                </p>
              )}
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 border border-gray-300 text-sm text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                戻る
              </button>
              <button
                type="button"
                onClick={doSubmit}
                disabled={loading}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                )}
                {loading ? "送信中..." : "投稿する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1 font-medium">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}
