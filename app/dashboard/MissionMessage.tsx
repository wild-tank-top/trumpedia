"use client";

import { useState } from "react";
import { Gift, Cpu, UserCheck, Copy, Check, Quote } from "lucide-react";

const COPY_TEXT = `【Trumpedia開発者からのご招待】

『Trumpedia』は、トランペット奏者の知見・思考・哲学を時間・場所の制約を超えて繋ぐQ&Aプラットフォームです。

日本中にいるトランペット吹きの中で、実際にあなたに会える人は少なく、あなたの優れた知見が一時の会話で消えていってしまうことが本当に惜しい。だからこのサイトを作りました。

Fellowとして参加することで——

🎁 現場で磨き上げた知恵を「消えない道標」として未来の奏者へ残せます。
🤖 蓄積された思考をもとにした「AIクローン」プロジェクトへご招待予定です。
📖 回答を重ねるだけで、あなたの音楽哲学が可視化されポートフォリオになります。

招待コードをお送りします。ぜひ一緒に、日本のトランペット界をより自由でクリエイティブなステージへ。

https://trumpedia.vercel.app/`;

const BENEFITS = [
  {
    icon: Gift,
    title: "次世代への「無形の贈り物」を残す",
    body: "現場で磨き上げた知恵を、一時の会話で終わらせない。あなたが楽器を置いた後も未来の奏者を助け続ける「消えない道標」になります。",
  },
  {
    icon: Cpu,
    title: "あなたの「分身（AI）」が24時間誰かを助ける",
    body: "蓄積された思考を学習し、あなたに代わって悩みを受け止める「AIクローン」プロジェクトを構想中。あなたの魂が未来の音楽シーンを支え続けます。",
  },
  {
    icon: UserCheck,
    title: "自分を表現する「新しいポートフォリオ」に",
    body: "回答を重ねるだけで、演奏だけでは伝えきれない「あなたの音楽哲学」が可視化され、信頼の証となります。",
  },
] as const;

export default function MissionMessage() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(COPY_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-800 bg-gray-950 text-gray-100 shadow-lg">

      {/* ── ヘッダー ────────────────────────────────── */}
      <div className="px-6 pt-7 pb-5 border-b border-gray-800">
        <p className="text-xs font-semibold tracking-widest text-amber-400/80 uppercase mb-2">
          Developer's Message
        </p>
        <h2 className="text-lg font-bold text-white leading-snug">
          Trumpedia 開発者からのメッセージ
        </h2>
      </div>

      {/* ── メッセージ本文 ──────────────────────────── */}
      <div className="px-6 py-6 space-y-4 border-b border-gray-800">
        <Quote size={20} className="text-amber-500/50" />
        <p className="text-sm text-gray-300 leading-relaxed">
          『Trumpedia』は、単なる質問サイトではありません。<br />
          一つの悩みに対し、複数のプロがそれぞれの視点で光を当てる。<br />
          そうすることで「こうあるべき」という固定観念を崩し、<br />
          日本のトランペット界をより自由で、クリエイティブなステージへ引き上げられると考えています。
        </p>
        <p className="text-sm text-gray-400 leading-relaxed">
          日本中にいるトランペット吹きの中で、実際にあなたに会える人は少なく、会話できるのはさらにほんの一握り。
          今はインターネットも発達し情報が世界中に届けられるのに、
          あなたの優れた価値観・知見を伝える場がなく、残らずに消えていってしまうことが本当に悔しいです。
          だからこのサイトを作りました。
        </p>
      </div>

      {/* ── ベネフィット ────────────────────────────── */}
      <div className="px-6 py-6 space-y-5 border-b border-gray-800">
        <h3 className="text-xs font-semibold tracking-widest text-amber-400/80 uppercase">
          Fellowとして、知恵を未来へ繋ぐ
        </h3>
        {BENEFITS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4">
            <div className="shrink-0 w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Icon size={16} className="text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-snug">{title}</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── フッター + コピーボタン ─────────────────── */}
      <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
          あなたの一言が、どこかの誰かを救い、喜びやひらめきを与えることを、私たちは心から信じています。
        </p>
        <button
          onClick={handleCopy}
          className={[
            "shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all",
            copied
              ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
              : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30",
          ].join(" ")}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "コピーしました！" : "招待文をコピー"}
        </button>
      </div>
    </div>
  );
}
