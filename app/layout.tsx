import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import HeaderNav from "./HeaderNav";
import NotificationBanner from "./components/NotificationBanner";
import Providers from "./providers";
import Link from "next/link";
import Image from "next/image";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-jp",
  preload: false, // 日本語フォントは全グリフのプリロードを省略
});

export const dynamic = "force-dynamic";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Trumpedia",
    template: "%s | Trumpedia",
  },
  description:
    "トランペット奏者の知見・思考プロセス・価値観を蓄積するQ&Aプラットフォーム。Fellowによる本格的な回答でトランペット上達を加速しましょう。",
  openGraph: {
    siteName: "Trumpedia",
    title: "Trumpedia",
    description:
      "トランペット奏者の知見・思考プロセス・価値観を蓄積するQ&Aプラットフォーム",
    url: siteUrl,
    type: "website",
    locale: "ja_JP",
    images: [
      {
        url: "/images/default-thumbnails/beginner.svg",
        width: 1200,
        height: 630,
        alt: "Trumpedia - トランペット奏者の知見プラットフォーム",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trumpedia",
    description:
      "トランペット奏者の知見・思考プロセス・価値観を蓄積するQ&Aプラットフォーム",
    images: ["/images/default-thumbnails/beginner.svg"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 未読通知を取得（Notificationテーブル未作成時は空配列で続行）
  const notifications = session?.user.id
    ? await prisma.notification
        .findMany({
          where: { userId: session.user.id, isRead: false },
          select: {
            id: true,
            questionId: true,
            question: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: "desc" },
        })
        .catch(() => [])
    : [];

  const unreadCount = notifications.length;

  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="bg-gray-50 text-gray-800 min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 relative">
          <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between">
            <Link href="/" className="shrink-0">
              <Image
                src="/trumpedia-logo.png"
                alt="Trumpedia"
                height={56}
                width={103}
                className="h-14 w-auto"
                priority
              />
            </Link>
            <HeaderNav session={session} unreadCount={unreadCount} />
          </div>
        </header>

        {/* 通知バナー：全ページ共通、ヘッダー直下 */}
        <NotificationBanner notifications={notifications} />

        <main className="max-w-3xl mx-auto px-4 py-6">
          <Providers>{children}</Providers>
        </main>
        <footer className="border-t border-gray-200 mt-12">
          <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">© 2026 Trumpedia</p>
            <nav className="flex items-center gap-4">
              <Link href="/terms" className="text-xs text-gray-400 hover:text-teal-600 transition-colors">
                利用規約
              </Link>
              <Link href="/privacy" className="text-xs text-gray-400 hover:text-teal-600 transition-colors">
                プライバシーポリシー
              </Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
