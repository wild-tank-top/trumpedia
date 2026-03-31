import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { extractKeyword } from "@/lib/extractKeyword";

export const runtime = "edge";

const GRADIENTS: Record<string, [string, string]> = {
  beginner:     ["#14b8a6", "#0d9488"],
  intermediate: ["#60a5fa", "#2563eb"],
  advanced:     ["#fbbf24", "#d97706"],
};

/** タイトル文字数に応じた px フォントサイズ（画像背景モード用） */
function titleFontSize(len: number): number {
  if (len <= 20) return 56;
  if (len <= 35) return 44;
  if (len <= 50) return 36;
  return 30;
}

/** キーワード文字数に応じた px フォントサイズ（グラデーションモード用） */
function keywordFontSize(len: number): number {
  if (len <= 3) return 120;
  if (len <= 5) return 96;
  if (len <= 7) return 80;
  if (len <= 9) return 64;
  return 52;
}

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const title     = searchParams.get("title")     ?? "";
  const level     = searchParams.get("level")     ?? "beginner";
  const thumbnail = searchParams.get("thumbnail") ?? ""; // "/assets/thumbnails/..."
  const [from, to] = GRADIENTS[level] ?? GRADIENTS.beginner;

  // 画像背景モード: thumbnail パスが指定されている場合
  const hasBgImage = thumbnail.startsWith("/assets/thumbnails/");
  const bgUrl = hasBgImage ? `${origin}${thumbnail}` : null;

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
    // フォント取得失敗時はデフォルトフォントで描画
  }

  const fontFamily = fontData ? "NotoSansJP" : "sans-serif";

  // ── 画像背景モード（thumbnail あり） ──────────────────────────────────
  if (bgUrl) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            position: "relative",
          }}
        >
          {/* 背景画像 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* 下部グラデーションオーバーレイ */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.1) 100%)",
            }}
          />

          {/* テキストコンテンツ */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "0 72px 60px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <span
              style={{
                fontSize: titleFontSize(title.length),
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
                fontFamily,
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              {title}
            </span>
            <span
              style={{
                fontSize: 22,
                color: "rgba(255,255,255,0.65)",
                fontWeight: 600,
                letterSpacing: "0.06em",
                fontFamily,
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

  // ── グラデーションモード（thumbnail なし / フォールバック） ────────────
  const keyword = extractKeyword(title);

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
              fontSize: keywordFontSize(keyword.length),
              fontWeight: 900,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              fontFamily,
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
              fontFamily,
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
