export const TIERS = [
  { min: 0,   label: "野生のヤシ酒",           en: "Wild Palm Wine",      border: "border-gray-200",    shadow: "",                   badge: "bg-gray-100 text-gray-500",           glow: ""                          },
  { min: 5,   label: "ティール・ジンの輝き",   en: "Sapphire Glow",       border: "border-teal-300",    shadow: "shadow-teal-100",    badge: "bg-teal-100 text-teal-700",           glow: ""                          },
  { min: 10,  label: "サファイア・ブルー・キュラソー", en: "Teal Curacao",   border: "border-blue-300",    shadow: "shadow-blue-100",    badge: "bg-blue-100 text-blue-700",           glow: "shadow-md shadow-blue-100" },
  { min: 20,  label: "深紫のピノ・ノワール",   en: "Deep Violet Pinot",   border: "border-violet-300",  shadow: "shadow-violet-100",  badge: "bg-violet-100 text-violet-700",       glow: "shadow-lg shadow-violet-200"},
  { min: 35,  label: "アンバー・マデイラ",     en: "Amber Madeira",       border: "border-amber-300",   shadow: "shadow-amber-100",   badge: "bg-amber-100 text-amber-700",         glow: "shadow-lg shadow-amber-200" },
  { min: 50,  label: "イエロー・シャルトルーズ",en: "Yellow Chartreuse",  border: "border-yellow-400",  shadow: "shadow-yellow-100",  badge: "bg-yellow-100 text-yellow-700",       glow: "shadow-xl shadow-yellow-200"},
  { min: 75,  label: "ローズ・シャンパーニュ", en: "Rose Champagne",      border: "border-rose-300",    shadow: "shadow-rose-100",    badge: "bg-rose-100 text-rose-700",           glow: "shadow-xl shadow-rose-200"  },
  { min: 100, label: "黄金の貴腐（ノーブル・ロット）", en: "Noble Rot Gold", border: "border-amber-400",  shadow: "shadow-amber-200",   badge: "bg-gradient-to-r from-amber-200 to-yellow-200 text-amber-800", glow: "shadow-2xl shadow-amber-300"},
] as const;

export function getTier(count: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (count >= TIERS[i].min) return { ...TIERS[i], index: i };
  }
  return { ...TIERS[0], index: 0 };
}
