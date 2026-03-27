"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CATEGORIES } from "@/lib/constants";

type FormData = {
  title: string;
  category: string;
  level: string;
  content: string;
};

const LEVELS = [
  { value: "beginner", label: "初級" },
  { value: "intermediate", label: "中級" },
  { value: "advanced", label: "上級" },
];

export default function NewQuestionPage() {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return null;
  }

  function handlePrepare(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;

    setPendingData({
      title: get("title"),
      category: get("category"),
      level: get("level"),
      content: get("content"),
    });
    setError("");
    setShowModal(true);
  }

  async function doSubmit() {
    if (!pendingData) return;
    setLoading(true);

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pendingData),
    });

    if (res.ok) {
      const question = await res.json();
      router.push(`/questions/${question.id}`);
    } else {
      const json = await res.json();
      setError(json.error ?? "エラーが発生しました");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">質問を投稿する</h1>
      <p className="text-sm text-gray-500 mb-8">
        疑問・悩みをできるだけ具体的に書くと、より良い回答が集まります。
      </p>

      <form onSubmit={handlePrepare} className="space-y-6">
        <Field label="タイトル" required hint="質問文そのものを書いてください（10文字以上推奨）">
          <input
            name="title"
            type="text"
            required
            minLength={10}
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
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="レベル" required>
            <select
              name="level"
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="">選択してください</option>
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="詳細・補足" required hint="質問の意図や背景、補足情報を書いてください">
          <textarea
            name="content"
            required
            rows={5}
            placeholder={`例：\n・トランペット歴3年です。高音域になるとすぐにバテてしまいます。\n・スタンプのエチュードに取り組んでいますが、正しいやり方が分かりません。`}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
          />
        </Field>

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
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
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
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
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
