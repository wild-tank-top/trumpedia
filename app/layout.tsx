import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/auth";
import HeaderNav from "./HeaderNav";
import Providers from "./providers";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trumpedia",
  description: "トランペット奏者の知見・思考プロセス・価値観を蓄積するWebアプリ",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-800 min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 relative">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-amber-600 tracking-tight shrink-0">
              🎺 Trumpedia
            </a>
            <HeaderNav session={session} />
          </div>
        </header>
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
