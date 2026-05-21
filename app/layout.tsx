import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import HeaderRuntime from "./components/HeaderRuntime";
import Providers from "./providers";
import Link from "next/link";
import { SITE_URL } from "@/lib/siteUrl";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-jp",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: "pjKOY2v7UC2VTAeCzBod0Lk2p9rDUAHMgsjalQoGszM",
  },
  title: {
    default: "Trumpedia｜トランペット奏者のQ&Aプラットフォーム",
    template: "%s | Trumpedia",
  },
  description:
    "Trumpedia（トランペディア）は、プロトランペット奏者の知見・思考プロセス・価値観を蓄積するQ&Aプラットフォームです。Fellow奏者による本格的な回答でトランペット上達を加速しましょう。",
  keywords: [
    "Trumpedia", "トランペディア", "トランペット", "Q&A", "トランペット奏者",
    "トランペット上達", "トランペット練習", "金管楽器", "吹奏楽", "オーケストラ",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    siteName: "Trumpedia",
    title: "Trumpedia｜トランペット奏者のQ&Aプラットフォーム",
    description:
      "プロトランペット奏者の知見・思考プロセス・価値観を蓄積するQ&Aプラットフォーム。Fellow奏者による本格的な回答でトランペット上達を加速。",
    url: SITE_URL,
    type: "website",
    locale: "ja_JP",
    images: [
      {
        url: `${SITE_URL}/images/og-default.png`,
        width: 1200,
        height: 630,
        alt: "Trumpedia - トランペット奏者のQ&Aプラットフォーム",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trumpedia｜トランペット奏者のQ&Aプラットフォーム",
    description:
      "プロトランペット奏者の知見・思考プロセス・価値観を蓄積するQ&Aプラットフォーム。",
    images: [`${SITE_URL}/images/og-default.png`],
  },
};

// JSON-LD: WebSite + SearchAction（サイトリンク検索ボックス）
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Trumpedia",
  alternateName: "トランペディア",
  url: SITE_URL,
  description:
    "プロトランペット奏者の知見・思考プロセス・価値観を蓄積するQ&Aプラットフォーム",
  inLanguage: "ja",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="ja" className={notoSansJP.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="bg-gray-50 text-gray-800 min-h-screen">
        <HeaderRuntime session={session} />

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
