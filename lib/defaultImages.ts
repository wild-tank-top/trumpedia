/**
 * 難易度別のデフォルトサムネイル画像パス
 * 質問にサムネイルが設定されていない場合に使用する
 */
const DEFAULT_IMAGES: Record<string, string> = {
  beginner:     "/images/defaults/beginner.svg",
  intermediate: "/images/defaults/intermediate.svg",
  advanced:     "/images/defaults/advanced.svg",
};

/**
 * 質問の難易度に応じたデフォルト画像パスを返す
 */
export function getDefaultImage(level: string): string {
  return DEFAULT_IMAGES[level] ?? "/images/defaults/default.svg";
}
