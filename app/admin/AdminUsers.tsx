"use client";

import { useState } from "react";
import Link from "next/link";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
  _count: { answers: number };
};

const ROLES = [
  { value: "guest", label: "ゲスト",  color: "bg-gray-100 text-gray-600" },
  { value: "fellow", label: "Fellow",  color: "bg-amber-100 text-amber-700" },
  { value: "admin", label: "管理者",  color: "bg-red-100 text-red-700" },
] as const;

export default function AdminUsers({ users: initial }: { users: User[] }) {
  const [users, setUsers] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  // alert廃止: id→エラーメッセージのMap
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function updateRole(id: string, role: string) {
    setLoadingId(id);
    // 対象ユーザーのエラーをクリア
    setErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } else {
      const json = await res.json();
      const message = json.error ?? "ロールの変更に失敗しました";
      setErrors((prev) => ({ ...prev, [id]: message }));
    }
    setLoadingId(null);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">ユーザー</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">回答数</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">ロール</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {(user.name ?? "?")[0]}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/contributors/${user.id}`}
                      className="font-medium text-gray-900 hover:text-amber-600 truncate block"
                    >
                      {user.name ?? "（名前未設定）"}
                    </Link>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    {/* インラインエラー表示（alertの代替） */}
                    {errors[user.id] && (
                      <p className="text-xs text-red-500 mt-0.5">{errors[user.id]}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                {user._count.answers}件
              </td>
              <td className="px-4 py-3">
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user.id, e.target.value)}
                  disabled={loadingId === user.id}
                  className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 transition-colors ${
                    ROLES.find((r) => r.value === user.role)?.color ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
