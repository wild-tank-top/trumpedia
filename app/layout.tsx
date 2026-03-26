import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/auth";
import HeaderNav from "./HeaderNav";

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
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-amber-600 tracking-tight">
              🎺 Trumpedia
            </a>
            <HeaderNav session={session} />
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
