export const CATEGORIES = [
  "エチュード・オケスタ",
  "タンギング・発音",
  "ハイトーン",
  "ロートーン",
  "メンタル・考え方・向き合い方",
  "呼吸・身体・奏法",
  "楽器・マウスピース",
  "楽曲の練習・解釈",
  "音源・動画",
  "音程・ソルフェージュ",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** カテゴリ文字列（カンマ区切り or 単体）を配列に変換 */
export function parseCategories(category: string): string[] {
  return category.split(",").map((s) => s.trim()).filter(Boolean);
}

/** 旧カテゴリ → 新カテゴリ のマッピング（DBマイグレーション用） */
export const CATEGORY_MIGRATION_MAP: Record<string, Category> = {
  音色:     "呼吸・身体・奏法",
  音程:     "音程・ソルフェージュ",
  テクニック: "呼吸・身体・奏法",
  メンタル:  "メンタル・考え方・向き合い方",
  練習法:   "楽曲の練習・解釈",
  音楽理論:  "音程・ソルフェージュ",
  楽器選び:  "楽器・マウスピース",
  その他:   "呼吸・身体・奏法",
};
