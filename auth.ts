import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// ── 型拡張 ────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
  interface User {
    role: string;
  }
}

// ── NextAuth設定 ──────────────────────────────────────
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,

  // セッションはJWT方式（DBに保存しないためシンプル）
  session: { strategy: "jwt" },

  providers: [
    // Google OAuth（本番環境向け）
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    // メール＋パスワード（ローカル開発向け）
    Credentials({
      name: "メールアドレスでログイン",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],

  callbacks: {
    // JWTにroleとidを追加
    async jwt({ token, user }) {
      // ログイン直後: 初回セット
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleCheckedAt = Date.now();
        return token;
      }

      // 5分ごとにのみDBからroleを再取得（毎リクエストDB参照を防ぐ）
      const FIVE_MINUTES = 5 * 60 * 1000;
      const checkedAt = (token.roleCheckedAt as number | undefined) ?? 0;
      if (token.id && Date.now() - checkedAt > FIVE_MINUTES) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.roleCheckedAt = Date.now();
        }
      }
      return token;
    },
    // セッションオブジェクトにidとroleを追加
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});
