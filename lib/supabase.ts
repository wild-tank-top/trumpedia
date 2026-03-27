import { createClient } from "@supabase/supabase-js";

/**
 * Service Role キーを使った管理者用 Supabase クライアント。
 * サーバーサイド（API Route / Server Component）専用。
 * クライアントコンポーネントには絶対にインポートしないこと。
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env vars are not set: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export const AVATAR_BUCKET = "avatars";
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB
