"use client";

/**
 * app/global-error.tsx
 * ルートレイアウト自体がエラーを投げた場合のフォールバック。
 * html / body タグを自前で持つ必要がある。
 */
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#f9fafb" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem" }}>⚠️</div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1f2937" }}>
            予期しないエラーが発生しました
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", maxWidth: "24rem" }}>
            ページの読み込み中に問題が発生しました。
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1.5rem",
              background: "#0d9488",
              color: "#fff",
              border: "none",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            再試行する
          </button>
        </div>
      </body>
    </html>
  );
}
