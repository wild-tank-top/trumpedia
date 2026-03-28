"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";

type NotificationItem = {
  id: number;
  questionId: number;
  question: { id: number; title: string };
};

export default function NotificationBanner({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  const count = notifications.length;

  // 閉じたときのカウントを保持。同数なら非表示。新しい通知が来たら再表示。
  const [dismissedAtCount, setDismissedAtCount] = useState<number | null>(null);

  const isVisible =
    count > 0 && (dismissedAtCount === null || count > dismissedAtCount);

  if (!isVisible) return null;

  // 1件なら直接質問ページへ、複数なら通知一覧へ
  const href =
    count === 1
      ? `/questions/${notifications[0].question.id}`
      : "/notifications";

  return (
    <div className="bg-teal-600 text-white">
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <Bell size={15} className="shrink-0 opacity-90" />
        <p className="flex-1 text-sm leading-snug">
          <span className="font-semibold">{count} 件</span>
          の回答済み質問に補足が追加されました。
          <Link
            href={href}
            className="underline underline-offset-2 ml-1 hover:no-underline font-medium"
          >
            内容を確認する →
          </Link>
        </p>
        <button
          onClick={() => setDismissedAtCount(count)}
          aria-label="通知バナーを閉じる"
          className="shrink-0 p-1 rounded hover:bg-teal-500 transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
