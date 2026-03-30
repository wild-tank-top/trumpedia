import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google OAuth アバター
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // GitHub OAuth アバター
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // Supabase Storage（プロジェクト固有のドメイン）
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
