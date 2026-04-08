/** アプリ内のロール定義 */
export const ALL_ROLES = ["guest", "fellow", "admin", "admin_fellow", "master_admin"] as const;
export type Role = (typeof ALL_ROLES)[number];

/** admin / admin_fellow / master_admin ならtrue */
export function isAdmin(role: string | null | undefined): boolean {
  return role === "admin" || role === "admin_fellow" || role === "master_admin";
}

/** fellow / admin_fellow ならtrue（Fellow権限を持つか） */
export function isFellow(role: string | null | undefined): boolean {
  return role === "fellow" || role === "admin_fellow";
}

/** master_admin のみtrue */
export function isMasterAdmin(role: string | null | undefined): boolean {
  return role === "master_admin";
}

/** このロールへ変更するのに master_admin 権限が必要か */
export function requiresMasterAdmin(role: string): boolean {
  return role === "admin" || role === "admin_fellow" || role === "master_admin";
}

/** 招待コード発行・申請紹介が可能か */
export function canIssueInvite(role: string | null | undefined): boolean {
  return role === "fellow" || role === "admin" || role === "admin_fellow" || role === "master_admin";
}

/** 共通ロールラベル定義（全ファイルで統一して使用） */
export const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  master_admin: { label: "マスター管理者",   color: "bg-red-200 text-red-800"       },
  admin:        { label: "管理者",           color: "bg-red-100 text-red-700"       },
  admin_fellow: { label: "管理者 / Fellow", color: "bg-purple-100 text-purple-700" },
  fellow:       { label: "Fellow",           color: "bg-amber-100 text-amber-700"   },
  guest:        { label: "ゲスト",           color: "bg-gray-100 text-gray-500"     },
};
