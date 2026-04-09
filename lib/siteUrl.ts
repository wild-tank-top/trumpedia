/**
 * サイトの正規 URL。
 * Vercel の Environment Variables に NEXT_PUBLIC_SITE_URL を設定することで
 * preview URL ではなく本番ドメインが canonical になる。
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");
