import { Gift, Cpu, UserCheck, Quote } from "lucide-react";

const BENEFITS = [
  {
    icon: Gift,
    title: "全国の奏者へ「無形の贈り物」を届ける",
    body: "現場で磨き上げた知恵を、一時の会話やレッスンで終わらせない。あなたの言葉は、場所を問わず日本中の奏者を導き、あなたが楽器を置いた後も「消えない道標」として残り続けます。",
    badge: null,
  },
  {
    icon: UserCheck,
    title: "自分を表現する「新しいポートフォリオ」に",
    body: "回答を重ねるだけで、演奏だけでは伝えきれない「あなたの音楽哲学」が可視化されます。デジタル上の「信頼の証」として、全国へ自分を届ける名刺代わりに活用してください。",
    badge: null,
  },
  {
    icon: Cpu,
    title: "あなたの「分身（AI）」が24時間誰かを助ける",
    body: "蓄積された思考を学習し、あなたに代わって悩みを受け止める「AIクローン」プロジェクトを構想中。あなたの魂を宿した存在が、24時間365日、未来の音楽シーンを支え続けます。",
    badge: "構想中",
  },
] as const;

export default function MissionMessage() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-800 bg-gray-950 text-gray-100 shadow-lg">

      {/* ── ヘッダー ────────────────────────────────── */}
      <div className="px-6 pt-7 pb-5 border-b border-gray-800 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-amber-400/80 uppercase mb-2">
            Developer's Message
          </p>
          <h2 className="text-lg font-bold text-white leading-snug">
            Trumpedia 開発者からのメッセージ
          </h2>
        </div>
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
        {BENEFITS.map(({ icon: Icon, title, body, badge }) => (
          <div key={title} className="flex gap-4">
            <div className={`shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center ${badge ? "bg-gray-700/50 border-gray-600" : "bg-amber-500/10 border-amber-500/20"}`}>
              <Icon size={16} className={badge ? "text-gray-400" : "text-amber-400"} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`text-sm font-semibold leading-snug ${badge ? "text-gray-400" : "text-white"}`}>
                  {title}
                </p>
                {badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 border border-gray-600 tracking-wide">
                    {badge}
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 leading-relaxed ${badge ? "text-gray-500" : "text-gray-400"}`}>
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── フッター ────────────────────────────────── */}
      <div className="px-6 py-5">
        <p className="text-xs text-gray-500 leading-relaxed">
          あなたの一言が、どこかの誰かを救い、喜びやひらめきを与えることを、私たちは心から信じています。
        </p>
      </div>
    </div>
  );
}
