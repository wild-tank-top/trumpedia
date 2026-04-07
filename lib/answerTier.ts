export const TIERS = [
  {
    min: 0,
    label: "野生のヤシ酒", en: "Wild Palm Wine",
    shape:  "relative overflow-hidden rounded-lg border",
    bg:     "bg-white",
    border: "border-gray-200",
    badge:  "bg-gray-100 text-gray-500",
    glow:   "",
    ornamentLevel: 0, ornamentColor: "",
  },
  {
    min: 5,
    label: "ティール・ジンの輝き", en: "Sapphire Glow",
    shape:  "relative overflow-hidden rounded-xl border-2",
    bg:     "bg-teal-50",
    border: "border-teal-400",
    badge:  "bg-teal-100 text-teal-700",
    glow:   "shadow-md shadow-teal-200",
    ornamentLevel: 0, ornamentColor: "",
  },
  {
    min: 10,
    label: "サファイア・ブルー・キュラソー", en: "Teal Curacao",
    shape:  "relative overflow-hidden rounded-2xl border-2",
    bg:     "bg-blue-50",
    border: "border-blue-400",
    badge:  "bg-blue-100 text-blue-700",
    glow:   "shadow-md shadow-blue-200",
    ornamentLevel: 1, ornamentColor: "text-blue-300",
  },
  {
    min: 20,
    label: "深紫のピノ・ノワール", en: "Deep Violet Pinot",
    shape:  "relative overflow-hidden rounded-2xl border-2 ring-1 ring-offset-2 ring-violet-300 ring-offset-violet-50",
    bg:     "bg-violet-50",
    border: "border-violet-400",
    badge:  "bg-violet-100 text-violet-700",
    glow:   "shadow-lg shadow-violet-300",
    ornamentLevel: 2, ornamentColor: "text-violet-400",
  },
  {
    min: 35,
    label: "アンバー・マデイラ", en: "Amber Madeira",
    shape:  "relative overflow-hidden rounded-2xl border-2 ring-2 ring-offset-2 ring-orange-300 ring-offset-orange-50",
    bg:     "bg-orange-50",
    border: "border-orange-400",
    badge:  "bg-orange-100 text-orange-700",
    glow:   "shadow-lg shadow-orange-200",
    ornamentLevel: 3, ornamentColor: "text-orange-400",
  },
  {
    min: 50,
    label: "イエロー・シャルトルーズ", en: "Yellow Chartreuse",
    shape:  "relative overflow-hidden rounded-2xl border-2 ring-2 ring-offset-2 ring-lime-400 ring-offset-lime-50",
    bg:     "bg-lime-50",
    border: "border-lime-500",
    badge:  "bg-lime-100 text-lime-700",
    glow:   "shadow-xl shadow-lime-300",
    ornamentLevel: 4, ornamentColor: "text-lime-500",
  },
  {
    min: 75,
    label: "ローズ・シャンパーニュ", en: "Rose Champagne",
    shape:  "relative overflow-hidden rounded-3xl border-2 ring-4 ring-offset-2 ring-rose-300 ring-offset-rose-50",
    bg:     "bg-rose-50",
    border: "border-rose-400",
    badge:  "bg-rose-100 text-rose-700",
    glow:   "shadow-xl shadow-rose-300",
    ornamentLevel: 5, ornamentColor: "text-rose-400",
  },
  {
    min: 100,
    label: "黄金の貴腐（ノーブル・ロット）", en: "Noble Rot Gold",
    shape:  "relative overflow-hidden rounded-3xl border-4 border-double ring-4 ring-offset-4 ring-yellow-400 ring-offset-yellow-50",
    bg:     "bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100",
    border: "border-yellow-500",
    badge:  "bg-gradient-to-r from-yellow-200 to-amber-200 text-amber-900",
    glow:   "shadow-2xl shadow-yellow-300",
    ornamentLevel: 6, ornamentColor: "text-yellow-500",
  },
] as const;

export function getTier(count: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (count >= TIERS[i].min) return { ...TIERS[i], index: i };
  }
  return { ...TIERS[0], index: 0 };
}
