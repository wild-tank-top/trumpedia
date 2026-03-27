"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      // 登録後に自動ログイン
      await signIn("credentials", { email, password, redirect: false });
      router.push("/");
      router.refresh();
    } else {
      const json = await res.json();
      setError(json.error ?? "エラーが発生しました");
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
            placeholder="山田 太郎"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">パスワード（8文字以上）</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
        >
          {loading ? "登録中..." : "アカウントを作成"}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-6">
        登録後、管理者がfellowロールを付与するまでは回答できません。
      </p>
    </div>
  );
}
