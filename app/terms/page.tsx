import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約 | Trumpedia",
};

const LAST_UPDATED = "2026年3月27日";

export default function TermsPage() {
  return (
    <LegalLayout title="利用規約" lastUpdated={LAST_UPDATED}>
      <Section title="第1条（適用）">
        <p>
          本規約は、Trumpedia（以下「本サービス」）の利用に関する条件を定めるものです。
          ユーザーは本規約に同意のうえ、本サービスをご利用ください。
        </p>
      </Section>

      <Section title="第2条（利用登録）">
        <p>本サービスへの登録は以下の方法で行えます。</p>
        <ul>
          <li>メールアドレスとパスワードによる登録</li>
          <li>Googleアカウントによる登録（OAuth 2.0）</li>
        </ul>
        <p className="mt-2">
          登録にあたっては、正確な情報を入力してください。
          虚偽の情報による登録は、予告なくアカウントを停止する場合があります。
        </p>
      </Section>

      <Section title="第3条（禁止事項）">
        <p>ユーザーは以下の行為を行ってはなりません。</p>
        <ul>
          <li>法令または公序良俗に違反するコンテンツの投稿</li>
          <li>他のユーザーへの誹謗中傷・嫌がらせ</li>
          <li>本サービスのサーバーへの不正アクセス・過剰な負荷をかける行為</li>
          <li>スパムや広告目的のコンテンツの投稿</li>
          <li>第三者の著作権・知的財産権を侵害する行為</li>
          <li>その他、運営者が不適切と判断する行為</li>
        </ul>
      </Section>

      <Section title="第4条（コンテンツの権利）">
        <p>
          ユーザーが投稿した質問・回答等のコンテンツに関する著作権はユーザー本人に帰属します。
          ただし、本サービスの運営・改善・宣伝に必要な範囲で、無償かつ非独占的に利用する権利を
          運営者に許諾したものとみなします。
        </p>
      </Section>

      <Section title="第5条（サービスの変更・停止）">
        <p>
          運営者は、ユーザーへの事前通知なく本サービスの内容を変更し、
          または提供を停止・終了することができます。
          これによりユーザーに損害が生じた場合でも、運営者は責任を負いません。
        </p>
      </Section>

      <Section title="第6条（免責事項）">
        <ul>
          <li>
            本サービスはトランペット演奏に関する情報共有を目的としており、
            投稿内容の正確性・完全性を保証するものではありません。
          </li>
          <li>
            ユーザーが本サービスを通じて得た情報をもとに行った行動の結果について、
            運営者は一切の責任を負いません。
          </li>
          <li>
            本サービスの利用によって生じた損害（直接・間接を問わず）について、
            運営者の故意または重大な過失がある場合を除き、賠償責任を負いません。
          </li>
          <li>
            第三者サービス（Google、OpenAI等）の障害・仕様変更による影響について、
            運営者は責任を負いません。
          </li>
        </ul>
      </Section>

      <Section title="第7条（規約の変更）">
        <p>
          運営者は必要に応じて本規約を変更できます。
          変更後も本サービスを継続して利用した場合、変更後の規約に同意したものとみなします。
          重要な変更については、サービス内でお知らせします。
        </p>
      </Section>

      <Section title="第8条（準拠法）">
        <p>本規約は日本法に準拠し、日本法に従って解釈されます。</p>
      </Section>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          本規約に関するお問い合わせは、サービス内のお問い合わせフォームよりご連絡ください。
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
      <div className="space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:text-gray-600">
        {children}
      </div>
    </section>
  );
}
