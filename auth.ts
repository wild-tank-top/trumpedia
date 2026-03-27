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
    role?: string;
  }
}

// ── NextAuth設定 ──────────────────────────────────────
// Google OAuthはenv変数が設定されている場合のみ有効化
const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // 既存メールアドレス（Credentials登録済み）との自動連携を許可
        allowDangerousEmailAccountLinking: true,
      })
    : null;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,

  session: { strategy: "jwt" },

  providers: [
    ...(googleProvider ? [googleProvider] : []),

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

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
          },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // 初回ログイン時のみuserオブジェクトが渡される
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        // OAuthユーザーはadapterがroleを返さないため、常にDBから取得する
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, image: true },
        });
        token.role = dbUser?.role ?? user.role ?? "guest";
        token.picture = dbUser?.image ?? token.picture ?? null;
        return token;
      }

      // 以降のリクエストでDBからroleとimageを再取得
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, image: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.picture = dbUser.image ?? token.picture ?? null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "guest";
        session.user.image = (token.picture as string | null) ?? null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});