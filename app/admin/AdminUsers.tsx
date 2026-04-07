"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronDown, ShieldAlert } from "lucide-react";
import { isMasterAdmin, requiresMasterAdmin } from "@/lib/roles";

type User = {
  id: string;
  name: string | null;
  role: string;
  createdAt: Date;
  _count: { answers: number };
};

const ROLES = [
  { value: "guest",        label: "ゲスト",          color: "bg-gray-100 text-gray-600"    },
  { value: "fellow",       label: "Fellow",          color: "bg-amber-100 text-amber-700"  },
  { value: "admin",        label: "管理者",           color: "bg-red-100 text-red-700"      },
  { value: "master_admin", label: "マスター管理者",   color: "bg-red-200 text-red-800"      },
] as const;

const FILTER_TABS = [
  { value: "all",          label: "全員"         },
  { value: "fellow",       label: "Fellow"       },
  { value: "guest",        label: "ゲスト"       },
  { value: "admin",        label: "管理者"       },
  { value: "master_admin", label: "マスター管理者" },
] as const;

type Filter = (typeof FILTER_TABS)[number]["value"];

function Initials({ name, role }: { name: string | null; role: string }) {
  const colorMap: Record<string, string> = {
    master_admin: "bg-red-200 text-red-800",
    admin:        "bg-red-100 text-red-700",
    fellow:       "bg-amber-100 text-amber-700",
    guest:        "bg-gray-100 text-gray-500",
  };
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${colorMap[role] ?? "bg-gray-100 text-gray-500"}`}>
      {(name ?? "?")[0].toUpperCase()}
    </div>
  );
}

export default function AdminUsers({
  users: initial,
  currentUserRole,
}: {
  users: User[];
  currentUserRole: string;
}) {
  const [users, setUsers]         = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [query, setQuery]         = useState("");
  const [filter, setFilter]       = useState<Filter>("all");
  const [confirmState, setConfirmState] = useState<{ id: string; role: string } | null>(null);

  const isMaster = isMasterAdmin(currentUserRole);

  // 現在のadminが選択できるロール一覧
  const selectableRoles = isMaster
    ? ROLES
    : ROLES.filter((r) => !requiresMasterAdmin(r.value));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchRole = filter === "all" || u.role === filter;
      const matchQ    = !q || (u.name ?? "").toLowerCase().includes(q);
      return matchRole && matchQ;
    });
  }, [users, query, filter]);

  const counts = useMemo(() => ({
    all:          users.length,
    fellow:       users.filter((u) => u.role === "fellow").length,
    guest:        users.filter((u) => u.role === "guest").length,
    admin:        users.filter((u) => u.role === "admin").length,
    master_admin: users.filter((u) => u.role === "master_admin").length,
  }), [users]);

  async function applyRoleChange(id: string, role: string) {
    setConfirmState(null);
    setLoadingId(id);
    setErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } else {
      const json = await res.json().catch(() => ({}));
      setErrors((prev) => ({ ...prev, [id]: json.error ?? "変更に失敗しました" }));
    }
    setLoadingId(null);
  }

  return (
    <div className="space-y-3">
      {/* 検索 + フィルター */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="名前で検索"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === tab.value
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-[10px] font-normal ${filter === tab.value ? "text-gray-500" : "text-gray-400"}`}>
                {counts[tab.value]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            該当するユーザーが見つかりません
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 font-medium">
                <th className="text-left px-4 py-2.5">ユーザー</th>
                <th className="text-left px-4 py-2.5 hidden sm:table-cell">回答数</th>
                <th className="text-left px-4 py-2.5 hidden md:table-cell">登録日</th>
                <th className="text-left px-4 py-2.5">ロール</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user) => {
                const isNew = Date.now() - new Date(user.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
                // adminやmaster_adminの変更はmaster_adminのみ可
                const canChange = requiresMasterAdmin(user.role) ? isMaster : true;

                return (
                  <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Initials name={user.name} role={user.role} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/contributors/${user.id}`}
                              className="font-medium text-gray-900 hover:text-amber-600 truncate"
                            >
                              {user.name ?? "（名前未設定）"}
                            </Link>
                            {isNew && (
                              <span className="text-[10px] bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                                NEW
                              </span>
                            )}
                          </div>
                          {errors[user.id] && (
                            <p className="text-xs text-red-500 mt-0.5">{errors[user.id]}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {user._count.answers}件
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden md:table-cell whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-3">
                      {canChange ? (
                        <div className="relative inline-block">
                          <select
                            value={user.role}
                            onChange={(e) => setConfirmState({ id: user.id, role: e.target.value })}
                            disabled={loadingId === user.id}
                            className={`appearance-none text-xs font-semibold pl-2.5 pr-6 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 transition-colors ${
                              ROLES.find((r) => r.value === user.role)?.color ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {selectableRoles.map((r) => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 opacity-60" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${ROLES.find((r) => r.value === user.role)?.color ?? "bg-gray-100 text-gray-600"}`}>
                            {ROLES.find((r) => r.value === user.role)?.label ?? user.role}
                          </span>
                          <ShieldAlert size={12} className="text-gray-300 shrink-0" aria-label="変更にはマスター管理者権限が必要です" />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 確認ダイアログ */}
      {confirmState && (() => {
        const target  = users.find((u) => u.id === confirmState.id);
        const newRole = ROLES.find((r) => r.value === confirmState.role);
        const isElevating = requiresMasterAdmin(confirmState.role);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            onClick={() => setConfirmState(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-gray-800">ロールを変更しますか？</h3>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{target?.name ?? "このユーザー"}</span> のロールを
                <span className={`inline-block mx-1 text-xs font-bold px-2 py-0.5 rounded-full ${newRole?.color ?? ""}`}>
                  {newRole?.label}
                </span>
                に変更します。
              </p>
              {confirmState.role === "guest" && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  ゲストに戻すと Fellows 申請履歴がリセットされ、再申請が必要になります。
                </p>
              )}
              {isElevating && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  管理者ロールへの昇格です。この操作はマスター管理者のみ実行できます。
                </p>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmState(null)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={() => applyRoleChange(confirmState.id, confirmState.role)}
                  className="px-4 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-colors"
                >
                  変更する
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
