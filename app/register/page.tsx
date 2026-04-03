"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [showInvite, setShowInvite] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form       = e.currentTarget;
    const name       = (form.elements.namedItem("name")       as HTMLInputElement).value;
    const email      = (form.elements.namedItem("email")      as HTMLInputElement).value;
    const password   = (form.elements.namedItem("password")   as HTMLInputElement).value;
    const inviteCode = (form.elements.namedItem("inviteCode") as HTMLInputElement)?.value?.trim();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, inviteCode: inviteCode || undefined }),
      });

      if (res.ok) {
        await signIn("credentials", { email, password, redirect: false });
        router.push("/dashboard");
        router.refresh();
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "登録に失敗しました");
        setLoading(false);
      }
    } catch (err) {
      console.error("[Register] ネットワークエラー:", err);
      setError("通信エラーが発生しました。もう一度お試しください。");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">新規登録</h1>
      <p className="text-sm text-gray-500 text-center mb-8">
        既にアカウントをお持ちの方は
        <Link href="/login" className="text-amber-600 hover:underline ml-1">ログイン</Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
          <input
            name="name"
            type="text"
            required
            disabled={loading}
            placeholder="山田 太郎"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
          <input
            name="email"
            type="email"
            required
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">パスワード（8文字以上）</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Fellows招待コード（任意・折りたたみ） */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button type="button" onClick={() => setShowInvite((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            <span className="text-sm text-gray-600">
              Fellows招待コードをお持ちの方
              <span className="text-xs text-gray-400 ml-1">（任意）</span>
            </span>
            {showInvite ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
          </button>
          {showInvite && (
            <div className="px-4 py-3 border-t border-gray-100">
              <input name="inviteCode" type="text" disabled={loading}
                placeholder="例：TRP8K2XZ" maxLength={12}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                onChange={(e) => { e.target.value = e.target.value.toUpperCase(); }}
              />
              <p className="text-xs text-gray-400 mt-1.5">
                招待コードは登録後でもダッシュボードから入力できます
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-start gap-2">
            <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
            </svg>
          )}
          {loading ? "登録中..." : "アカウントを作成"}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-6">
        ゲストとして登録後、Fellows招待コードで参加申請できます。
      </p>
    </div>
  );
}
