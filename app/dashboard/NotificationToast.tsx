"use client";

import { useEffect, useRef, useState } from "react";
import { X, MessageSquare } from "lucide-react";
import Link from "next/link";

type ToastItem = {
  id: number;
  type: "site" | "mine";
  questionId: number;
  questionTitle: string;
  actorName: string;
};

type ActivityItem = {
  id: number;
  type: "site" | "mine";
  questionId: number;
  questionTitle: string;
  actorName: string;
  createdAt: string;
};

const POLL_INTERVAL = 30_000; // 30秒

export default function NotificationToast() {
  const [queue, setQueue]   = useState<ToastItem[]>([]);
  const [current, setCurrent] = useState<ToastItem | null>(null);
  const [visible, setVisible] = useState(false);
  const seenIds   = useRef(new Set<number>());
  const sinceRef  = useRef(new Date().toISOString());
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // キューから次のトーストを表示
  useEffect(() => {
    if (!current && queue.length > 0) {
      const [next, ...rest] = queue;
      setCurrent(next);
      setQueue(rest);
      requestAnimationFrame(() => setVisible(true));

      timerRef.current = setTimeout(() => dismiss(), 6000);
    }
  }, [queue, current]);

  function dismiss() {
    setVisible(false);
    setTimeout(() => {
      setCurrent(null);
      if (timerRef.current) clearTimeout(timerRef.current);
    }, 300);
  }

  // ポーリング
  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch(`/api/activity/recent?since=${encodeURIComponent(sinceRef.current)}`);
        if (!res.ok) return;
        const data: { site: ActivityItem[]; mine: ActivityItem[] } = await res.json();
        sinceRef.current = new Date().toISOString();

        const newItems: ToastItem[] = [];

        // 自分の質問への回答（orange）を優先
        for (const item of data.mine) {
          if (!seenIds.current.has(item.id)) {
            seenIds.current.add(item.id);
            newItems.unshift({ id: item.id, type: "mine", questionId: item.questionId, questionTitle: item.questionTitle, actorName: item.actorName });
          }
        }
        // サイト全体の活動（blue）
        for (const item of data.site) {
          if (!seenIds.current.has(item.id)) {
            seenIds.current.add(item.id);
            newItems.push({ id: item.id, type: "site", questionId: item.questionId, questionTitle: item.questionTitle, actorName: item.actorName });
          }
        }

        if (newItems.length > 0) {
          setQueue((prev) => [...prev, ...newItems].slice(0, 5));
        }
      } catch {
        // silently ignore
      }
    }

    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  if (!current) return null;

  const isMine = current.type === "mine";

  return (
    <div
      className={[
        "fixed top-20 right-4 z-[200] w-72 sm:w-80",
        "transition-all duration-300 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3",
      ].join(" ")}
      role="alert"
    >
      <div
        className={[
          "rounded-2xl border backdrop-blur-sm px-4 py-3 shadow-lg",
          isMine
            ? "bg-amber-50/90 border-amber-200 shadow-amber-100"
            : "bg-blue-50/90 border-blue-200 shadow-blue-100",
        ].join(" ")}
      >
        <div className="flex items-start gap-2.5">
          <div
            className={[
              "shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5",
              isMine ? "bg-amber-100" : "bg-blue-100",
            ].join(" ")}
          >
            <MessageSquare size={13} className={isMine ? "text-amber-600" : "text-blue-600"} />
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold ${isMine ? "text-amber-700" : "text-blue-700"}`}>
              {isMine ? "あなたの質問に回答が届きました" : `${current.actorName} さんが回答しました`}
            </p>
            <Link
              href={`/questions/${current.questionId}`}
              onClick={dismiss}
              className="text-xs text-gray-600 hover:text-gray-800 line-clamp-1 mt-0.5 transition-colors"
            >
              {current.questionTitle}
            </Link>
          </div>

          <button
            onClick={dismiss}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded"
            aria-label="閉じる"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
