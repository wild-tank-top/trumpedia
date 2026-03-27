"use client";

import { useEffect } from "react";

/**
 * ViewTracker
 * マウント時に1回だけ /api/questions/[id]/view を叩いて閲覧数を +1 する。
 * UIを持たない（非表示）コンポーネント。
 *
 * ■ なぜクライアント側で行うか
 *   - サーバーコンポーネントで直接 increment するとプリフェッチや
 *     Next.js のキャッシュ再利用で二重カウントが発生する恐れがある
 *   - useEffect は実際にブラウザで描画されたタイミングのみ実行されるため、
 *     ボット・プリフェッチによる誤カウントを自然に排除できる
 */
export default function ViewTracker({ questionId }: { questionId: number }) {
  useEffect(() => {
    fetch(`/api/questions/${questionId}/view`, { method: "POST" }).catch(
      () => {
        // カウント失敗はサイレントに無視（UX に影響させない）
      }
    );
    // 空の依存配列 → マウント時に1回だけ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
