"use client";

import { useEffect, useState } from "react";
import type { Session } from "next-auth";
import Link from "next/link";
import Image from "next/image";
import HeaderNav from "@/app/HeaderNav";
import NotificationBanner from "@/app/components/NotificationBanner";

type NotificationItem = {
  id: number;
  questionId: number;
  question: { id: number; title: string };
};

type HeaderState = {
  notifications: NotificationItem[];
  unreadCount: number;
  tierRingClass: string;
  adminPendingCount: number;
};

const EMPTY_STATE: HeaderState = {
  notifications: [],
  unreadCount: 0,
  tierRingClass: "",
  adminPendingCount: 0,
};

export default function HeaderRuntime({ session }: { session: Session | null }) {
  const [state, setState] = useState<HeaderState>(EMPTY_STATE);

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    let cancelled = false;
    fetch("/api/header-state", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : EMPTY_STATE))
      .then((json: HeaderState) => {
        if (!cancelled) setState(json);
      })
      .catch(() => {
        if (!cancelled) setState(EMPTY_STATE);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 relative">
        <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <Image
              src="/trumpedia-logo.png"
              alt="Trumpedia"
              height={56}
              width={196}
              className="h-10 sm:h-14 w-auto"
              sizes="(max-width: 640px) 140px, 196px"
              priority
            />
          </Link>
          <HeaderNav
            session={session}
            unreadCount={state.unreadCount}
            tierRingClass={state.tierRingClass}
          />
        </div>
      </header>

      {state.adminPendingCount > 0 && (
        <div className="bg-blue-600 text-white text-sm px-4 py-2.5 flex items-center justify-center gap-3">
          <span>
            Fellows 最終承認待ちが
            <span className="font-bold mx-1">{state.adminPendingCount}件</span>
            あります
          </span>
          <Link
            href="/admin"
            className="underline underline-offset-2 font-medium hover:text-blue-100 transition-colors shrink-0"
          >
            管理画面を開く →
          </Link>
        </div>
      )}

      <NotificationBanner notifications={state.notifications} />
    </>
  );
}
