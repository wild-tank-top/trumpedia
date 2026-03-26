"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Session } from "next-auth";

export default function AnswerForm({
  questionId,
  session,
}: {
  questionId: number;
  session: Session | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // 未ログイン
  if (!session) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="mb-3">回答するにはログインが必要です</p>
        <Link href="/login" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full text-sm transition-colors">
          ログインする
        </Link>
      </div>
    );
  }

  // Proでない
  if (session.user?.role !== "pro" && session.user?.role !== "admin") {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-sm">回答の投稿は <span className="font-semibold text-teal-600">Proユーザー</span> のみ可能です。</p>
        <p className="text-xs mt-1 text-gray-400">管理者にProロールの付与を依頼してください。</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLTextAreaElement | HTMLInputElement).value;

    const data = {
      summary: get("summary"),
      causeAnalysis: get("causeAnalysis"),
      thinking: get("thinking"),
      approach: get("approach"),
      ngExamples: get("ngExamples"),
      exceptions: get("exceptions"),
      philosophy: get("philosophy"),
    };

    const res = await fetch(`/api/questions/${questionId}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.refresh();
      form.reset();
      setDone(true);
    } else {
      const json = await res.json();
      setError(json.error ?? "エラーが発生しました");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <p className="text-teal-600 font-medium">✓ 回答を投稿しました</p>
        <button onClick={() => setDone(false)} className="text-sm text-gray-400 mt-2 hover:underline">
          続けて回答する
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="要約" required hint="この回答を一言でまとめると？">
        <textarea name="summary" required rows={2}
          placeholder="例：息のスピードを上げるより、アパチュアを絞ることが先決"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
      </Field>

      <Field label="原因分析" required hint="なぜその問題が起きているのか？">
        <textarea name="causeAnalysis" required rows={3}
          placeholder="例：ハイトーンが出ない主な原因は..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
      </Field>

      <Field label="思考プロセス" required hint="どう考えてこのアプローチに至ったか？">
        <textarea name="thinking" required rows={3}
          placeholder="例：まずリップスラーで確認し、次に..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
      </Field>

      <Field label="具体的なアプローチ" required hint="実際に何をすればよいか？">
        <textarea name="approach" required rows={3}
          placeholder="例：①ロングトーンで口周りの筋肉を意識する ②..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
      </Field>

      <Field label="NGな例" hint="やってはいけないこと（任意）">
        <textarea name="ngExamples" rows={2}
          placeholder="例：無理に息を増やすと逆効果..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
      </Field>

      <Field label="例外・注意点" hint="当てはまらないケースや注意点（任意）">
        <textarea name="exceptions" rows={2}
          placeholder="例：マウスピースが合っていない場合は別の話..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
      </Field>

      <Field label="価値観・哲学" hint="この問題に対するあなたの考え方（任意）">
        <textarea name="philosophy" rows={2}
          placeholder="例：トランペットは自然体であることが一番大切..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
      </Field>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm">
        {loading ? "送信中..." : "回答を投稿する"}
      </button>
    </form>
  );
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-0.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      {children}
    </div>
  );
}
