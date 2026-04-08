"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "next-auth";
import { getTier, TIERS } from "@/lib/answerTier";
import { isFellow as isFellowRole, isAdmin as isAdminRole } from "@/lib/roles";

type ExistingAnswer = {
  id: number;
  summary: string;
  causeAnalysis: string;
  thinking: string;
  approach: string;
  ngExamples: string;
  exceptions: string;
  philosophy: string;
};

export default function AnswerForm({
  questionId,
  session,
  existingAnswer,
}: {
  questionId: number;
  session: Session | null;
  existingAnswer?: ExistingAnswer | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [milestoneCount, setMilestoneCount] = useState<number | null>(null);

  const isEditing = !!existingAnswer;

  // 親コンポーネントで session チェック済みだが、型安全のため null guard
  if (!session) return null;

  // Fellowでない
  if (!isFellowRole(session.user?.role) && !isAdminRole(session.user?.role)) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-sm">
          回答の投稿は{" "}
          <span className="font-semibold text-teal-600">Fellowユーザー</span>{" "}
          のみ可能です。
        </p>
        <p className="text-xs mt-1 text-gray-400">
          管理者にFellowロールの付与を依頼してください。
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const get = (name: string) =>
      (
        form.elements.namedItem(name) as
          | HTMLTextAreaElement
          | HTMLInputElement
      ).value;

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
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.refresh();
      if (!isEditing) {
        form.reset();
        const json = await res.json().catch(() => ({}));
        if (typeof json.totalAnswerCount === "number") {
          setMilestoneCount(json.totalAnswerCount);
        }
      }
      setDone(true);
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "エラーが発生しました。もう一度お試しください。");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="text-center py-6 space-y-3">
        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 px-4 py-2 rounded-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">
            回答を{isEditing ? "更新" : "投稿"}しました
          </span>
        </div>

        {!isEditing && milestoneCount !== null && (() => {
          const t        = getTier(milestoneCount);
          const nextTier = TIERS[t.index + 1] ?? null;
          const toNext   = nextTier ? nextTier.min - milestoneCount : 0;
          const progress = nextTier
            ? Math.min(Math.round(((milestoneCount - t.min) / (nextTier.min - t.min)) * 100), 100)
            : 100;
          return (
            <div className={`border rounded-xl px-4 py-4 ${t.bg} ${t.border}`}>
              {/* 件数 + 現在ティア */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">
                  累計 <span className="text-2xl font-bold text-gray-900 mx-0.5">{milestoneCount}</span> 件
                </p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.badge}`}>
                  {t.label}
                </span>
              </div>

              {/* プログレスバー */}
              <div className="w-full bg-white/70 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-700 ${t.bar}`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* 目盛り + 次ティア情報 */}
              {nextTier ? (
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-gray-400">{t.min}件</span>
                  <span className="text-xs text-gray-500">
                    あと <span className="font-bold text-gray-700">{toNext}</span> 件で
                    <span className={`inline-block ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${nextTier.badge}`}>
                      {nextTier.label}
                    </span>
                  </span>
                  <span className="text-[10px] text-gray-400">{nextTier.min}件</span>
                </div>
              ) : (
                <p className="text-xs text-center font-semibold text-amber-600 mt-1.5">✨ 最高ランク到達！</p>
              )}
            </div>
          );
        })()}

        {isEditing ? (
          <p>
            <button
              onClick={() => setDone(false)}
              className="text-sm text-teal-600 hover:underline"
            >
              再編集する
            </button>
          </p>
        ) : (
          <p>
            <button
              onClick={() => setDone(false)}
              className="text-sm text-gray-400 hover:underline"
            >
              続けて回答する
            </button>
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isEditing && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <p className="text-xs text-amber-700">
            既に回答済みです。以下のフォームから内容を更新できます。
          </p>
        </div>
      )}

      <Field label="要約" required hint="この回答を一言でまとめると？">
        <textarea
          name="summary"
          required
          rows={2}
          defaultValue={existingAnswer?.summary}
          placeholder="例：息のスピードを上げるより、アパチュアを絞ることが先決"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
        />
      </Field>

      <Field label="原因分析" hint="なぜその問題が起きているのか？（任意）">
        <textarea
          name="causeAnalysis"
          rows={3}
          defaultValue={existingAnswer?.causeAnalysis}
          placeholder="例：ハイトーンが出ない主な原因は..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
        />
      </Field>

      <Field label="思考プロセス" hint="どう考えてこのアプローチに至ったか？（任意）">
        <textarea
          name="thinking"
          rows={3}
          defaultValue={existingAnswer?.thinking}
          placeholder="例：まずリップスラーで確認し、次に..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
        />
      </Field>

      <Field label="具体的なアプローチ" required hint="実際に何をすればよいか？">
        <textarea
          name="approach"
          required
          rows={3}
          defaultValue={existingAnswer?.approach}
          placeholder="例：①ロングトーンで口周りの筋肉を意識する ②..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
        />
      </Field>

      <Field label="NGな例" hint="やってはいけないこと（任意）">
        <textarea
          name="ngExamples"
          rows={2}
          defaultValue={existingAnswer?.ngExamples}
          placeholder="例：無理に息を増やすと逆効果..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
        />
      </Field>

      <Field label="例外・注意点" hint="当てはまらないケースや注意点（任意）">
        <textarea
          name="exceptions"
          rows={2}
          defaultValue={existingAnswer?.exceptions}
          placeholder="例：マウスピースが合っていない場合は別の話..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
        />
      </Field>

      <Field label="価値観・哲学" hint="この問題に対するあなたの考え方（任意）">
        <textarea
          name="philosophy"
          rows={2}
          defaultValue={existingAnswer?.philosophy}
          placeholder="例：トランペットは自然体であることが一番大切..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
        />
      </Field>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-start gap-2">
          <svg
            className="w-4 h-4 text-red-500 mt-0.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
      >
        {loading && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
            />
          </svg>
        )}
        {loading
          ? isEditing ? "更新中..." : "送信中..."
          : isEditing ? "回答を更新する" : "回答を投稿する"}
      </button>
    </form>
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
      <label className="block text-sm font-medium text-gray-700 mb-0.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      {children}
    </div>
  );
}
