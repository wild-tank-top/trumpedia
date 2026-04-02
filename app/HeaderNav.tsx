"use client";

import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import Avatar from "@/app/components/Avatar";
import {
  Menu, X, Users, PenLine, Settings,
  LogOut, LogIn, UserPlus, LayoutDashboard, ListOrdered, User,
} from "lucide-react";

const ROLE_LABELS = {
  admin: { label: "管理者", color: "bg-red-100 text-red-700" },
  fellow: { label: "Fellow", color: "bg-amber-100 text-amber-700" },
  guest: { label: "ゲスト", color: "bg-gray-100 text-gray-500" },
} as const;

type Role = keyof typeof ROLE_LABELS;

export default function HeaderNav({
  session,
  unreadCount = 0,
}: {
  session: Session | null;
  unreadCount?: number;
}) {
  const [open, setOpen] = useState(false);           // モバイルメニュー
  const [dropOpen, setDropOpen] = useState(false);   // PCアバタードロップダウン
  const pathname = usePathname();
  const dropRef = useRef<HTMLDivElement>(null);

  // ページ遷移でメニューを閉じる
  useEffect(() => { setOpen(false); setDropOpen(false); }, [pathname]);

  // Escキー / 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDropOpen(false); };
    const onClickOutside = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
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

            {/* アバター + ドロップダウン */}
            <div className="relative ml-1" ref={dropRef}>
              <button
                onClick={() => setDropOpen((v) => !v)}
                className="relative flex items-center gap-2 pl-2 border-l border-gray-200 hover:opacity-80 transition-opacity"
                aria-haspopup="true"
                aria-expanded={dropOpen}
              >
                <Avatar src={session.user.image} name={session.user.name} size="sm" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 left-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {/* ドロップダウンメニュー */}
              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
                  {/* ユーザー情報 */}
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {session.user.name ?? "ユーザー"}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* メニュー項目 */}
                  <div className="py-1">
                    <DropdownLink href={`/contributors/${session.user.id}`} icon={<User size={14} />}>
                      プロフィール
                    </DropdownLink>
                    <DropdownLink href="/my-questions" icon={<ListOrdered size={14} />}>
                      自分の質問
                    </DropdownLink>
                    {(role === "fellow" || role === "admin") && (
                      <DropdownLink href="/dashboard" icon={<LayoutDashboard size={14} />}>
                        Dashboard
                      </DropdownLink>
                    )}
                    {role === "admin" && (
                      <DropdownLink href="/admin" icon={<Settings size={14} />}>
                        管理画面
                      </DropdownLink>
                    )}
                  </div>

                  {/* ログアウト */}
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut size={14} />
                      ログアウト
                    </button>
                  </div>
                </div>
              )}
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
      <div className="sm:hidden relative">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={open}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
        </button>
        {unreadCount > 0 && !open && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white pointer-events-none" />
        )}
      </div>

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

              <MobileLink href="/my-questions" icon={<ListOrdered size={18} />} onClick={close}>
                自分の質問
              </MobileLink>

              {(role === "fellow" || role === "admin") && (
                <MobileLink href="/dashboard" icon={<LayoutDashboard size={18} />} onClick={close}>
                  Dashboard
                </MobileLink>
              )}

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

// ── PCドロップダウン内リンク ───────────────────────────────────
function DropdownLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <span className="text-gray-400">{icon}</span>
      {children}
    </Link>
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
