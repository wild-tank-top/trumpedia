/**
 * デフォルトサムネイル画像プール
 * 質問投稿時に thumbnail が指定されていない場合、ここからランダムに割り当てる
 */
const THUMBNAIL_POOL = [
  "/images/default-thumbnails/trumpet-1.svg",
  "/images/default-thumbnails/trumpet-2.svg",
  "/images/default-thumbnails/trumpet-3.svg",
  "/images/default-thumbnails/trumpet-4.svg",
  "/images/default-thumbnails/trumpet-5.svg",
] as const;

/**
 * 質問投稿時にランダムなデフォルトサムネイルを返す（API側で使用）
 */
export function pickRandomThumbnail(): string {
  return THUMBNAIL_POOL[Math.floor(Math.random() * THUMBNAIL_POOL.length)];
}

/**
 * 表示時フォールバック（DBに thumbnail が未保存の既存質問用）
 */
export function getDefaultImage(_level: string): string {
  return THUMBNAIL_POOL[0];
}
