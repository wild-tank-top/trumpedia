export const TIERS = [
  { min: 0,   label: "見習い奏者",  en: "Newcomer",    border: "border-gray-200",    shadow: "",                   badge: "bg-gray-100 text-gray-500",           glow: ""                          },
  { min: 5,   label: "演奏者",      en: "Apprentice",  border: "border-teal-300",    shadow: "shadow-teal-100",    badge: "bg-teal-100 text-teal-700",           glow: ""                          },
  { min: 10,  label: "楽団員",      en: "Contributor", border: "border-blue-300",    shadow: "shadow-blue-100",    badge: "bg-blue-100 text-blue-700",           glow: "shadow-md shadow-blue-100" },
  { min: 20,  label: "首席奏者",    en: "Principal",   border: "border-violet-300",  shadow: "shadow-violet-100",  badge: "bg-violet-100 text-violet-700",       glow: "shadow-lg shadow-violet-200"},
  { min: 35,  label: "ソリスト",    en: "Soloist",     border: "border-amber-300",   shadow: "shadow-amber-100",   badge: "bg-amber-100 text-amber-700",         glow: "shadow-lg shadow-amber-200" },
  { min: 50,  label: "マエストロ",  en: "Maestro",     border: "border-yellow-400",  shadow: "shadow-yellow-100",  badge: "bg-yellow-100 text-yellow-700",       glow: "shadow-xl shadow-yellow-200"},
  { min: 75,  label: "チャンピオン",en: "Champion",    border: "border-rose-300",    shadow: "shadow-rose-100",    badge: "bg-rose-100 text-rose-700",           glow: "shadow-xl shadow-rose-200"  },
  { min: 100, label: "レジェンド",  en: "Legend",      border: "border-amber-400",   shadow: "shadow-amber-200",   badge: "bg-gradient-to-r from-amber-200 to-yellow-200 text-amber-800", glow: "shadow-2xl shadow-amber-300"},
] as const;

export function getTier(count: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (count >= TIERS[i].min) return { ...TIERS[i], index: i };
  }
  return { ...TIERS[0], index: 0 };
}
