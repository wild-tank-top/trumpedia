import Image from "next/image";

/**
 * 実画像サムネイル — 16:9固定・object-cover + CSSオーバーレイでタイトル合成。
 * 画像がない場合は TextThumbnail に切り替えること（このコンポーネントは src 必須）。
 */
export default function ThumbnailImage({
  src,
  title,
  category,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px",
  className = "",
}: {
  src: string;
  title: string;
  category?: string;
  sizes?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full aspect-video overflow-hidden ${className}`}
      aria-label={title}
    >
      {/* 背景画像：16:9 を維持しながら object-cover で表示 */}
      <Image
        src={src}
        alt={title}
        fill
        className="object-cover"
        sizes={sizes}
      />

      {/* 下部グラデーション：文字可読性確保 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5 pointer-events-none" />

      {/* テキストオーバーレイ */}
      <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
        {category && (
          <span className="inline-block text-[10px] font-medium text-white/80 bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-full mb-1.5">
            {category}
          </span>
        )}
        <p className="text-sm font-bold text-white leading-snug line-clamp-2 drop-shadow-sm">
          {title}
        </p>
      </div>
    </div>
  );
}
