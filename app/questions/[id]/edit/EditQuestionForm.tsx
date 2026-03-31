"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { ImageIcon, ChevronDown } from "lucide-react";
import ThumbnailPicker from "@/app/components/ThumbnailPicker";

type Question = {
  id: number;
  title: string;
  category: string;
  level: string;
  content: string;
  thumbnail?: string | null;
};

const LEVELS = [
  { value: "beginner", label: "初級" },
  { value: "intermediate", label: "中級" },
  { value: "advanced", label: "上級" },
];

export default function EditQuestionForm({ question }: { question: Question }) {
  const router = useRouter();
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [title, setTitle]         = useState(question.title);
  const [thumbnail, setThumbnail] = useState(question.thumbnail ?? "");
  const [showPicker, setShowPicker] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;

    const data = {
      title,
      category: get("category"),
      level:    get("level"),
      content:  get("content"),
      thumbnail,
    };

    const res = await fetch(`/api/questions/${question.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push(`/questions/${question.id}`);
      router.refresh();
    } else {
      const json = await res.json();
      setError(json.error ?? "エラーが発生しました");
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">質問を編集する</h1>
        <Link href={`/questions/${question.id}`} className="text-sm text-gray-400 hover:text-gray-600">
          ← 戻る
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field label="タイトル" required hint="質問文そのものを書いてください（10文字以上推奨）">
          <input
            name="title"
            type="text"
            required
            minLength={10}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="カテゴリ" required>
            <select
              name="category"
              required
              defaultValue={question.category}
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
              defaultValue={question.level}
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
            defaultValue={question.content}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
          />
        </Field>

        {/* ── アイキャッチ画像 ── */}
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

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Link
            href={`/questions/${question.id}`}
            className="flex-1 border border-gray-300 text-sm text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "保存中..." : "変更を保存する"}
          </button>
        </div>
      </form>
    </>
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
