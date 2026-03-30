import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { extractKeyword } from "@/lib/extractKeyword";

export const runtime = "edge";

const GRADIENTS: Record<string, [string, string]> = {
  beginner:     ["#14b8a6", "#0d9488"],
  intermediate: ["#60a5fa", "#2563eb"],
  advanced:     ["#fbbf24", "#d97706"],
};

/** キーワード文字数に応じた px フォントサイズ */
function fontSize(len: number): number {
  if (len <= 3) return 120;
  if (len <= 5) return 96;
  if (len <= 7) return 80;
  if (len <= 9) return 64;
  return 52;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "";
  const level = searchParams.get("level") ?? "beginner";
  const keyword = extractKeyword(title);
  const [from, to] = GRADIENTS[level] ?? GRADIENTS.beginner;

  // Noto Sans JP Bold を Google Fonts から取得（日本語レンダリング用）
  let fontData: ArrayBuffer | undefined;
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@900",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    ).then((r) => r.text());
    const fontUrl = css.match(/src: url\((.+?)\)/)?.[1];
    if (fontUrl) {
      fontData = await fetch(fontUrl).then((r) => r.arrayBuffer());
    }
  } catch {
    // フォント取得失敗時はブラウザデフォルトフォントで描画
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
          position: "relative",
        }}
      >
        {/* 装飾サークル */}
        <div
          style={{
            position: "absolute",
            width: 590,
            height: 590,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />

        {/* コンテンツ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            zIndex: 1,
            padding: "0 80px",
          }}
        >
          <span
            style={{
              fontSize: fontSize(keyword.length),
              fontWeight: 900,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              fontFamily: fontData ? "NotoSansJP" : "sans-serif",
            }}
          >
            {keyword}
          </span>
          <span
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.70)",
              fontWeight: 600,
              letterSpacing: "0.08em",
              fontFamily: fontData ? "NotoSansJP" : "sans-serif",
            }}
          >
            Trumpedia
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontData
        ? [{ name: "NotoSansJP", data: fontData, weight: 900, style: "normal" }]
        : undefined,
    }
  );
}
