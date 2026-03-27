"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import Avatar from "@/app/components/Avatar";
import {
  Menu, X, Users, PenLine, Settings,
  LogOut, LogIn, UserPlus,
} from "lucide-react";

const ROLE_LABELS = {
  admin: { label: "管理者", color: "bg-red-100 text-red-700" },
  fellow: { label: "Fellow", color: "bg-amber-100 text-amber-700" },
  guest: { label: "ゲスト", color: "bg-gray-100 text-gray-500" },
} as const;

type Role = keyof typeof ROLE_LABELS;

export default function HeaderNav({ session }: { session: Session | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // ページ遷移でメニューを閉じる
  useEffect(() => { setOpen(false); }, [pathname]);

  // Escキーでメニューを閉じる
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const role = (session?.user?.role ?? "guest") as Role;
  const badge = ROLE_LABELS[role] ?? ROLE_LABELS.guest;
  const close = () => setOpen(false);

  return (
    <>
      {/* ══ PC ナビ（sm 以上で表示） ════════════════════════ */}
      <nav className="hidden sm:flex items-center gap-1">
        <Link
          href="/fellows"
          className="text-sm text-gray-600 hover:text-teal-600 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
        >
          Fellows
        </Link>

        {session ? (
          <>
            <Link
              href="/questions/new"
              className="text-sm bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-full transition-colors ml-1"
            >
              質問を投稿
            </Link>

            {role === "admin" && (
              <Link
                href="/admin"
                className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                管理
              </Link>
            )}

            {/* ユーザーエリア */}
            <div className="flex items-center gap-2 pl-2 ml-1 border-l border-gray-200">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                {badge.label}
              </span>
              <Link
                href={`/contributors/${session.user.id}`}
                className="hover:opacity-80 transition-opacity"
                title={session.user.name ?? "プロフィール"}
              >
                <Avatar src={session.user.image} name={session.user.name} size="sm" />
              </Link>
              <span className="text-sm text-gray-700 hidden md:inline max-w-[100px] truncate">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors whitespace-nowrap"
              >
                ログアウト
              </button>
            </div>
          </>
        ) : (
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-teal-600 transition-colors px-3 py-1.5 rounded-lg"
          >
            ログイン
          </Link>
        )}
      </nav>

      {/* ══ モバイル：ハンバーガーボタン（sm 未満で表示） ═══ */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={open}
        className="sm:hidden w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
      >
        {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
      </button>

      {/* ══ モバイルメニュー：backdrop ════════════════════════ */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-black/20"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* ══ モバイルメニュー：ドロワー（ヘッダー直下） ════════ */}
      {/* 親の <header> が relative なので absolute top-full がヘッダー下端に貼り付く */}
      <div
        className={[
          "sm:hidden absolute top-full left-0 right-0 z-50",
          "bg-white border-b border-gray-200 shadow-lg",
          "transition-all duration-200 origin-top",
          open
            ? "opacity-100 scale-y-100 pointer-events-auto"
            : "opacity-0 scale-y-95 pointer-events-none",
        ].join(" ")}
        aria-hidden={!open}
      >
        <nav className="max-w-3xl mx-auto px-3 py-3 space-y-0.5">

          {/* Fellows は常に表示 */}
          <MobileLink href="/fellows" icon={<Users size={18} />} onClick={close}>
            Fellows
          </MobileLink>

          {session ? (
            <>
              <MobileLink href="/questions/new" icon={<PenLine size={18} />} onClick={close}>
                質問を投稿
              </MobileLink>

              {role === "admin" && (
                <MobileLink href="/admin" icon={<Settings size={18} />} onClick={close}>
                  管理画面
                </MobileLink>
              )}

              {/* プロフィール */}
              <MobileLink
                href={`/contributors/${session.user.id}`}
                icon={<Avatar src={session.user.image} name={session.user.name} size="sm" />}
                onClick={close}
              >
                {session.user.name ?? "プロフィール"}
              </MobileLink>

              {/* 区切り + ロールバッジ + ログアウト */}
              <div className="pt-2 mt-1 border-t border-gray-100 space-y-0.5">
                <div className="flex items-center gap-2 px-4 py-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-xs text-gray-400 truncate">{session.user.email}</span>
                </div>
                <button
                  onClick={() => { close(); signOut({ callbackUrl: "/" }); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors text-sm font-medium text-left"
                >
                  <LogOut size={18} />
                  ログアウト
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 mt-1 border-t border-gray-100 space-y-0.5">
              <MobileLink href="/login" icon={<LogIn size={18} />} onClick={close}>
                ログイン
              </MobileLink>
              <MobileLink href="/register" icon={<UserPlus size={18} />} onClick={close}>
                新規登録
              </MobileLink>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}

// ── モバイルメニュー内リンク共通コンポーネント ──────────────────
function MobileLink({
  href,
  icon,
  onClick,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-amber-50 hover:text-amber-700 active:bg-amber-100 transition-colors text-sm font-medium min-h-[44px]"
    >
      <span className="shrink-0 text-gray-400">{icon}</span>
      <span className="truncate">{children}</span>
    </Link>
  );
}
