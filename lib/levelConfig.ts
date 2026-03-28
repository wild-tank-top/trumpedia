/**
 * 難易度ごとのスタイル設定（一覧カード・詳細ページ共通）
 */

export const LEVEL_LABELS: Record<string, string> = {
  beginner:     "初級",
  intermediate: "中級",
  advanced:     "上級",
};

export type LevelStyle = {
  // ── 一覧カード ──────────────────────────────────────
  bar:          string; // 上端アクセントライン
  cardBorder:   string; // カード枠線
  cardHover:    string; // ホバー時の枠線
  placeholder:  string; // サムネイルプレースホルダー
  badge:        string; // 難易度バッジ
  // ── 詳細ページ ──────────────────────────────────────
  detailBg:     string; // 質問コンテナ背景
  detailBorder: string; // 質問コンテナ枠線
  detailTitle:  string; // タイトルテキスト色
};

export const LEVEL_STYLES: Record<string, LevelStyle> = {
  beginner: {
    bar:          "bg-teal-400",
    cardBorder:   "border-gray-200",
    cardHover:    "hover:border-teal-300 hover:shadow-md",
    placeholder:  "from-teal-50 via-green-50 to-teal-100",
    badge:        "bg-teal-100 text-teal-700",
    detailBg:     "bg-gradient-to-br from-teal-50 to-green-50",
    detailBorder: "border-teal-200",
    detailTitle:  "text-gray-900",
  },
  intermediate: {
    bar:          "bg-blue-400",
    cardBorder:   "border-gray-200",
    cardHover:    "hover:border-blue-300 hover:shadow-md",
    placeholder:  "from-blue-50 via-sky-50 to-blue-100",
    badge:        "bg-blue-100 text-blue-700",
    detailBg:     "bg-gradient-to-br from-blue-50 to-sky-50",
    detailBorder: "border-blue-200",
    detailTitle:  "text-gray-900",
  },
  advanced: {
    // ゴールドの質感：amber-300 のボーダー + amber → yellow の繊細なグラデーション
    bar:          "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500",
    cardBorder:   "border-amber-300",
    cardHover:    "hover:border-amber-400 hover:shadow-md hover:shadow-amber-100",
    placeholder:  "from-amber-50 via-yellow-100 to-amber-200",
    badge:        "bg-amber-200 text-amber-800 font-semibold",
    detailBg:     "bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-200",
    detailBorder: "border-amber-300",
    detailTitle:  "text-amber-900",
  },
};

export const DEFAULT_LEVEL_STYLE: LevelStyle = {
  bar:          "bg-gray-300",
  cardBorder:   "border-gray-200",
  cardHover:    "hover:border-gray-300 hover:shadow-md",
  placeholder:  "from-gray-50 to-gray-100",
  badge:        "bg-gray-100 text-gray-600",
  detailBg:     "bg-white",
  detailBorder: "border-gray-200",
  detailTitle:  "text-gray-900",
};
