import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー | Trumpedia",
};

const LAST_UPDATED = "2026年3月27日";

export default function PrivacyPage() {
  return (
    <LegalLayout title="プライバシーポリシー" lastUpdated={LAST_UPDATED}>
      <p className="text-gray-600">
        Trumpedia（以下「本サービス」）は、ユーザーのプライバシーを尊重し、
        個人情報を適切に管理します。本ポリシーは収集する情報と利用目的を説明するものです。
      </p>

      <Section title="1. 収集する情報">
        <p>本サービスは以下の情報を収集します。</p>

        <Subsection title="ユーザー登録情報">
          <ul>
            <li>メールアドレス</li>
            <li>表示名（ユーザーが設定した名前）</li>
            <li>パスワード（bcryptによるハッシュ化後に保存。平文では保存しません）</li>
            <li>プロフィール画像（任意でアップロードした場合）</li>
          </ul>
        </Subsection>

        <Subsection title="Googleログイン利用時">
          <p>
            本サービスはGoogle OAuth 2.0を通じたログインに対応しています。
            Googleログインを利用した場合、Google が提供する以下の情報を取得します。
          </p>
          <ul>
            <li>メールアドレス</li>
            <li>Googleアカウントの表示名</li>
            <li>Googleアカウントのプロフィール画像URL</li>
          </ul>
          <p className="mt-2">
            Googleへの情報提供については、
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:underline mx-1"
            >
              Googleプライバシーポリシー
            </a>
            をご確認ください。
          </p>
        </Subsection>

        <Subsection title="投稿コンテンツ">
          <ul>
            <li>投稿した質問・回答の内容</li>
            <li>いいね・閲覧数等の行動ログ</li>
          </ul>
        </Subsection>

        <Subsection title="自動収集情報">
          <ul>
            <li>IPアドレス（サーバーログとして一時的に記録される場合があります）</li>
            <li>ブラウザの種類・バージョン（アクセス解析に利用する場合があります）</li>
          </ul>
        </Subsection>
      </Section>

      <Section title="2. 利用目的">
        <p>収集した情報は以下の目的で利用します。</p>
        <ul>
          <li>アカウントの認証・管理</li>
          <li>質問・回答機能等、本サービスの提供</li>
          <li>ユーザーへの通知・お知らせ（サービス上での表示）</li>
          <li>不正利用の検知・防止</li>
          <li>サービスの改善・新機能の開発</li>
        </ul>
        <p className="mt-2">
          上記以外の目的で個人情報を利用する場合は、事前にユーザーの同意を得ます。
        </p>
      </Section>

      <Section title="3. 第三者提供">
        <p>
          以下の場合を除き、収集した個人情報を第三者に提供・開示することはありません。
        </p>
        <ul>
          <li>ユーザー本人の同意がある場合</li>
          <li>法令に基づき開示が必要な場合</li>
          <li>人の生命・身体・財産の保護のために必要な場合</li>
        </ul>
      </Section>

      <Section title="4. 利用する外部サービス">
        <p>本サービスは以下の外部サービスを利用しており、それぞれのプライバシーポリシーが適用されます。</p>
        <div className="mt-3 space-y-3">
          <ServiceItem
            name="Supabase"
            description="データベース・ファイルストレージ（プロフィール画像）の提供"
            url="https://supabase.com/privacy"
          />
          <ServiceItem
            name="Google OAuth"
            description="Googleアカウントによるログイン機能"
            url="https://policies.google.com/privacy"
          />
          <ServiceItem
            name="OpenAI"
            description="AIサムネイル生成機能（質問タイトルをプロンプトとして送信）"
            url="https://openai.com/policies/privacy-policy"
          />
        </div>
      </Section>

      <Section title="5. データの保管と削除">
        <ul>
          <li>収集した情報はSupabaseのデータベースに保管します。</li>
          <li>
            アカウントの削除を希望する場合は、お問い合わせフォームよりご連絡ください。
            合理的な期間内にデータを削除します。
          </li>
          <li>
            法令上の義務がある場合など、削除できないケースがあります。
          </li>
        </ul>
      </Section>

      <Section title="6. セキュリティ">
        <p>
          パスワードはbcryptを用いてハッシュ化し、平文では保存しません。
          ただし、インターネット上の通信は完全に安全であることを保証するものではなく、
          セキュリティ上の問題が発生した場合は速やかに対応します。
        </p>
      </Section>

      <Section title="7. 未成年者のご利用">
        <p>
          18歳未満の方が本サービスを利用する場合は、保護者の同意を得てください。
        </p>
      </Section>

      <Section title="8. ポリシーの変更">
        <p>
          本ポリシーは必要に応じて変更することがあります。
          重要な変更については、本サービス上でお知らせします。
          変更後に本サービスを継続して利用した場合、変更後のポリシーに同意したものとみなします。
        </p>
      </Section>

      <div className="mt-8 pt-6 border-t border-gray-100 space-y-1">
        <p className="text-sm text-gray-500">
          本ポリシーに関するお問い合わせは、サービス内のお問い合わせフォームよりご連絡ください。
        </p>
      </div>
    </LegalLayout>
  );
}

function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-sm text-teal-600 hover:underline">
          ← トップに戻る
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-sm text-gray-400 mb-8">最終更新日：{lastUpdated}</p>
      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-8 text-sm leading-relaxed text-gray-700">
        {children}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-gray-900 mb-3">{title}</h2>
      <div className="space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:text-gray-600">
        {children}
      </div>
    </section>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pl-3 border-l-2 border-teal-100">
      <p className="font-medium text-gray-800 mb-2">{title}</p>
      <div className="space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:text-gray-600">
        {children}
      </div>
    </div>
  );
}

function ServiceItem({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium shrink-0 mt-0.5">
        {name}
      </span>
      <span className="text-gray-600">
        {description}（
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
          プライバシーポリシー
        </a>
        ）
      </span>
    </div>
  );
}
