"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 質問ページ表示時に、この質問の未読通知を既読にして通知ドットを消す
export default function NotificationReader({ questionId }: { questionId: number }) {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId }),
    })
      .then((res) => res.json())
      .then(({ count }) => {
        // 実際に既読化した通知があった場合だけ再レンダリング（ドット消去）
        if (count > 0) router.refresh();
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  return null;
}
