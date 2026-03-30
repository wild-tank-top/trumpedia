import { extractKeyword } from "@/lib/extractKeyword";

/** 難易度別グラデーション（beginner=teal / intermediate=blue / advanced=amber） */
const LEVEL_GRADIENTS: Record<string, { from: string; to: string }> = {
  beginner:     { from: "#14b8a6", to: "#0d9488" },
  intermediate: { from: "#60a5fa", to: "#2563eb" },
  advanced:     { from: "#fbbf24", to: "#d97706" },
};

const DEFAULT_GRADIENT = { from: "#9ca3af", to: "#6b7280" };

/** キーワードの文字数に応じてフォントサイズを決める */
function fontSizeClass(len: number): string {
  if (len <= 3) return "text-5xl";
  if (len <= 5) return "text-4xl";
  if (len <= 7) return "text-3xl";
  return "text-2xl";
}

export default function TextThumbnail({
  title,
  level,
  className = "",
}: {
  title: string;
  level: string;
  className?: string;
}) {
  const keyword = extractKeyword(title);
  const { from, to } = LEVEL_GRADIENTS[level] ?? DEFAULT_GRADIENT;

  return (
    <div
      className={`relative flex items-center justify-center w-full aspect-video overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
      aria-label={title}
    >
      {/* 背景の装飾サークル */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ width: "70%", paddingBottom: "70%", background: "rgba(255,255,255,0.06)" }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ width: "45%", paddingBottom: "45%", background: "rgba(255,255,255,0.06)" }}
      />

      {/* キーワード本体 */}
      <span
        className={`relative z-10 text-white font-black tracking-tight leading-tight text-center px-4 drop-shadow ${fontSizeClass(keyword.length)}`}
        style={{ fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif" }}
      >
        {keyword}
      </span>
    </div>
  );
}
