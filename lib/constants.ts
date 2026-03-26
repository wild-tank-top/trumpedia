export const CATEGORIES = [
  "音色",
  "音程",
  "テクニック",
  "メンタル",
  "練習法",
  "音楽理論",
  "その他",
] as const;

export type Category = (typeof CATEGORIES)[number];
