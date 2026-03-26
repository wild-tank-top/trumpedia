"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import type { Session } from "next-auth";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: "管理者", color: "bg-red-100 text-red-700" },
  pro:   { label: "Pro",    color: "bg-amber-100 text-amber-700" },
  guest: { label: "ゲスト", color: "bg-gray-100 text-gray-500" },
};

export default function HeaderNav({ session }: { session: Session | null }) {
  if (!session) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/questions/new"
          className="text-sm bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-full transition-colors"
        >
          質問を投稿
        </Link>
        <Link
          href="/login"
          className="text-sm text-gray-600 hover:text-teal-600 transition-colors"
        >
          ログイン
        </Link>
      </div>
    );
  }

  const role = session.user.role ?? "guest";
  const badge = ROLE_LABELS[role] ?? ROLE_LABELS.guest;

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/questions/new"
        className="text-sm bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-full transition-colors"
      >
        質問を投稿
      </Link>

      {session.user.role === "admin" && (
        <Link href="/admin" className="text-sm text-red-600 hover:underline">
          管理
        </Link>
      )}

      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
          {badge.label}
        </span>
        <span className="text-sm text-gray-700 hidden sm:inline">
          {session.user.name}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
