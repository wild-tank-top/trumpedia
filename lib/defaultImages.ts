/**
 * 難易度別デフォルトサムネイル（ピクトグラム）
 * 質問投稿時・表示時ともにここから難易度に応じた画像を返す
 */
const LEVEL_IMAGES: Record<string, string> = {
  beginner:     "/images/default-thumbnails/beginner.svg",
  intermediate: "/images/default-thumbnails/intermediate.svg",
  advanced:     "/images/default-thumbnails/advanced.svg",
};

/**
 * 難易度に応じたデフォルトサムネイルパスを返す
 * (質問投稿 API・カード表示・OGP で共通使用)
 */
export function getDefaultImage(level: string): string {
  return LEVEL_IMAGES[level] ?? LEVEL_IMAGES.beginner;
}
