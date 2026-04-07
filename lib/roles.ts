/** アプリ内のロール定義 */
export const ALL_ROLES = ["guest", "fellow", "admin", "master_admin"] as const;
export type Role = (typeof ALL_ROLES)[number];

/** admin または master_admin ならtrue */
export function isAdmin(role: string | null | undefined): boolean {
  return role === "admin" || role === "master_admin";
}

/** master_admin のみtrue */
export function isMasterAdmin(role: string | null | undefined): boolean {
  return role === "master_admin";
}

/** このロールへ変更するのに master_admin 権限が必要か */
export function requiresMasterAdmin(role: string): boolean {
  return role === "admin" || role === "master_admin";
}
