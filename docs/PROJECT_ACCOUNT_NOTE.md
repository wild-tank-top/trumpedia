---
tags:
  - project/trumpedia
  - accounts
  - operations
  - env
aliases:
  - Trumpedia アカウント整理
  - trumpedia tools and accounts
---

# Trumpedia｜ツール・ログイン・アカウント整理

> Obsidian 用メモ。APIキー、パスワード、Secretの実値はここに直接書かず、保管場所だけを書く。
> 最終更新: 2026-05-21

## まず見る場所

| 項目 | 内容 |
|---|---|
| プロジェクト名 | Trumpedia / trumpedia |
| ローカル場所 | `/Users/sawatomoki/Desktop/claudecode test/trumpedia` |
| GitHub | https://github.com/wild-tank-top/trumpedia |
| ローカルURL | http://localhost:3000 |
| 起動コマンド | `npm run dev` |
| ビルド | `npm run build` |
| 本番起動 | `npm run start` |
| フレームワーク | Next.js 16 / React 19 / TypeScript |
| DB | Prisma + PostgreSQL |
| 環境変数 | `.env` |
| Prisma schema | `prisma/schema.prisma` |

## 自分で埋める基本情報

| 項目 | 記入欄 |
|---|---|
| プロジェクト管理者 |  |
| メイン連絡先メール |  |
| 緊急連絡先 |  |
| 本番URL |  |
| 独自ドメイン |  |
| ドメイン管理会社 |  |
| DNS管理場所 |  |
| パスワード管理場所 | 例: 1Password / iCloudキーチェーン / 紙の保管場所など |
| 2FA保管場所 |  |
| バックアップコード保管場所 |  |

## アカウント一覧

| サービス | 用途 | ログインURL | ログイン方法 | 登録メール | 2FA | 支払い | メモ |
|---|---|---|---|---|---|---|---|
| GitHub | ソースコード管理 | https://github.com |  |  |  |  | リポジトリ: `wild-tank-top/trumpedia` |
| Vercel | Next.jsデプロイ候補 / 本番ホスティング | https://vercel.com |  |  |  |  | `VERCEL_URL`, `NEXT_PUBLIC_SITE_URL` に関連 |
| Supabase | PostgreSQL / Storage / 管理API | https://supabase.com/dashboard |  |  |  |  | `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Google Cloud Console | Google OAuth / Gemini API | https://console.cloud.google.com |  |  |  |  | OAuth Client ID / Secret、Gemini API key |
| Google AI Studio | Gemini APIキー / モデル確認 | https://aistudio.google.com |  |  |  |  | `GOOGLE_GENERATION_AI_API_KEY` |
| OpenAI Platform | サムネイル画像生成 | https://platform.openai.com |  |  |  |  | `OPENAI_API_KEY` |
| Google Analytics | アクセス解析 | https://analytics.google.com |  |  |  |  | `NEXT_PUBLIC_GA_ID` |
| Google Tag Manager | GAタグ配信元 | https://tagmanager.google.com |  |  |  |  | `googletagmanager.com/gtag/js` を利用 |
| Prisma | ORM / DBマイグレーション | https://www.prisma.io |  |  |  |  | Prisma自体はアカウント不要 |
| NextAuth.js / Auth.js | 認証 | https://authjs.dev |  |  |  |  | Credentials + Google OAuth |

## 外部サービスURL一覧

| サービス | 管理画面 / ログイン | APIキー・設定 | ドキュメント / ヘルプ | メモ |
|---|---|---|---|---|
| GitHub | https://github.com | https://github.com/settings/tokens | https://docs.github.com | リポジトリ: https://github.com/wild-tank-top/trumpedia |
| Vercel | https://vercel.com/dashboard | https://vercel.com/account/tokens | https://vercel.com/docs | Next.js本番デプロイ候補 |
| Vercel Environment Variables | https://vercel.com/dashboard | https://vercel.com/docs/projects/environment-variables | https://vercel.com/docs/projects/environment-variables | 本番環境変数を設定 |
| Supabase Dashboard | https://supabase.com/dashboard | https://supabase.com/dashboard/project/_/settings/api | https://supabase.com/docs | Project URL / service role key |
| Supabase Database | https://supabase.com/dashboard/project/_/database/tables | https://supabase.com/dashboard/project/_/settings/database | https://supabase.com/docs/guides/database | PostgreSQL接続文字列 |
| Supabase Storage | https://supabase.com/dashboard/project/_/storage/buckets | https://supabase.com/docs/guides/storage | https://supabase.com/docs/guides/storage | `avatars` bucket |
| Google Cloud Console | https://console.cloud.google.com | https://console.cloud.google.com/apis/credentials | https://cloud.google.com/docs | Google OAuth |
| Google OAuth Consent | https://console.cloud.google.com/apis/credentials/consent | https://console.cloud.google.com/auth/overview | https://support.google.com/cloud/answer/10311615 | OAuth同意画面 |
| Google AI Studio | https://aistudio.google.com | https://aistudio.google.com/app/apikey | https://ai.google.dev/gemini-api/docs | Gemini API |
| Gemini API Docs | https://ai.google.dev | https://aistudio.google.com/app/apikey | https://ai.google.dev/gemini-api/docs | モデル: `gemini-2.5-flash-lite` |
| OpenAI Platform | https://platform.openai.com | https://platform.openai.com/api-keys | https://platform.openai.com/docs | 画像生成 / API |
| Google Analytics | https://analytics.google.com | https://analytics.google.com | https://support.google.com/analytics | GA4 |
| Google Tag Manager | https://tagmanager.google.com | https://tagmanager.google.com | https://support.google.com/tagmanager | GAタグ周辺確認 |
| Prisma | https://www.prisma.io | https://www.prisma.io/data-platform | https://www.prisma.io/docs | ORM / migration |
| Auth.js | https://authjs.dev | https://authjs.dev/reference | https://authjs.dev/getting-started | NextAuth v5 |
| Next.js | https://nextjs.org | https://nextjs.org/docs | https://nextjs.org/docs | App Router |

## 重要な環境変数

### 必須・本番推奨

| 変数名 | 用途 | 設定場所 | 状態 | メモ |
|---|---|---|---|---|
| `DATABASE_URL` | Prisma / PostgreSQL接続 | `.env` / Vercel |  | Supabaseの接続文字列と思われる |
| `AUTH_SECRET` | Auth.js / NextAuthの署名Secret | `.env` / Vercel |  | 本番必須 |
| `AUTH_TRUST_HOST` | Auth.jsのホスト信頼設定 | `.env` / Vercel |  | デプロイ環境に合わせて確認 |
| `NEXT_PUBLIC_SITE_URL` | サイトの公開URL | `.env` / Vercel |  | 未設定時は `VERCEL_URL` から推定 |
| `VERCEL_URL` | Vercelが自動設定するURL | Vercel |  | 手動設定不要の場合あり |

### 認証

| 変数名 | 用途 | 設定場所 | 状態 | メモ |
|---|---|---|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `.env` / Vercel |  | 設定時のみGoogleログイン有効 |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `.env` / Vercel |  | Secret実値は記載しない |

### Supabase

| 変数名 | 用途 | 設定場所 | 状態 | メモ |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `.env` / Vercel |  | public値 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase管理用キー | `.env` / Vercel |  | サーバー専用。漏洩厳禁 |
| `DATABASE_URL` | DB接続 | `.env` / Vercel |  | Prismaが使用 |
| Supabase bucket | アバター保存 | Supabase Storage |  | bucket名: `avatars` |

### AI

| 変数名 | 用途 | 設定場所 | 状態 | メモ |
|---|---|---|---|---|
| `GOOGLE_GENERATION_AI_API_KEY` | Gemini API | `.env` / Vercel |  | AIチャット / 質問整形など |
| `OPENAI_API_KEY` | OpenAI API | `.env` / Vercel |  | サムネイル画像生成で使用 |

### 計測

| 変数名 | 用途 | 設定場所 | 状態 | メモ |
|---|---|---|---|---|
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 | `.env` / Vercel |  | `G-...` |

## デプロイ整理

### Vercel

| 項目 | 記入欄 |
|---|---|
| 使っているか |  |
| Project URL |  |
| Production URL |  |
| Dashboard URL |  |
| GitHub連携 | `wild-tank-top/trumpedia` |
| Build Command | `npm run build` |
| Install Command | `npm install` |
| Output / Framework | Next.js |
| Environment Variables設定場所 |  |
| 最終デプロイ確認日 |  |

### Supabase

| 項目 | 記入欄 |
|---|---|
| Project name |  |
| Project ref |  |
| Project URL |  |
| Dashboard URL |  |
| Database password保管場所 |  |
| Connection string保管場所 |  |
| Service Role Key保管場所 |  |
| Storage bucket | `avatars` |
| 最終バックアップ確認日 |  |

## Google OAuth 設定チェック

| 項目 | 記入欄 |
|---|---|
| Google Cloud Project名 |  |
| Project ID |  |
| OAuth Client名 |  |
| Client ID保管場所 |  |
| Client Secret保管場所 |  |
| ローカル redirect URI |  |
| 本番 redirect URI |  |
| OAuth同意画面の公開状態 |  |
| テストユーザー |  |
| 最終ログイン確認日 |  |

## AI API 設定チェック

| 項目 | 記入欄 |
|---|---|
| Gemini APIキー保管場所 |  |
| Gemini利用モデル | `gemini-2.5-flash-lite` |
| Google Cloud請求設定 |  |
| OpenAI APIキー保管場所 |  |
| OpenAI用途 | サムネイル画像生成 |
| 月次利用料金確認日 |  |

## ローカル開発メモ

```bash
cd "/Users/sawatomoki/Desktop/claudecode test/trumpedia"
npm install
npm run dev
```

```bash
npx prisma generate
npx prisma migrate dev
```

| 項目 | 記入欄 |
|---|---|
| Node.js version |  |
| npm version |  |
| ローカル `.env` 更新日 |  |
| よく使う起動ポート | `3000` |
| DB接続先 |  |
| よく見るログ |  |

## 運用チェックリスト

### デプロイ前

- [ ] `.env` の実値をGitに入れていない
- [ ] Vercel Environment Variables が最新
- [ ] `AUTH_SECRET` 設定済み
- [ ] `DATABASE_URL` が本番DBを指している
- [ ] Prisma migration を確認
- [ ] Google OAuth redirect URIを確認
- [ ] Supabase Storage bucket `avatars` を確認
- [ ] Gemini APIキーを確認
- [ ] OpenAI APIキーを確認
- [ ] Google Analytics IDを確認
- [ ] `npm run build` が通る

### 月次確認

- [ ] Vercel利用料金
- [ ] Supabase利用料金 / DB容量 / Storage容量
- [ ] Google Gemini API利用料金
- [ ] OpenAI API利用料金
- [ ] Google Analytics計測
- [ ] DBバックアップ
- [ ] Google OAuth同意画面の状態

## シークレット保管場所メモ

| 種類 | 保管場所 | 更新日 | 備考 |
|---|---|---|---|
| `.env` 実ファイル | ローカルのみ |  | Git管理しない |
| Vercel Environment Variables | Vercel Dashboard |  |  |
| Supabase Service Role Key |  |  | サーバー専用 |
| Supabase Database URL |  |  |  |
| Google OAuth Client Secret |  |  |  |
| Gemini API Key |  |  |  |
| OpenAI API Key |  |  |  |
| バックアップコード |  |  |  |

## 未確認・あとで埋める

- [ ] 本番URL
- [ ] Vercelを実際に使っているか
- [ ] Supabase Project名 / Project ref
- [ ] Google Cloud Project名
- [ ] Google OAuth本番 redirect URI
- [ ] Gemini APIの請求アカウント
- [ ] OpenAI APIの請求アカウント
- [ ] DBバックアップ手順
- [ ] 障害時の連絡・復旧手順

