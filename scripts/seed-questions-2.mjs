// scripts/seed-questions-2.mjs
// 使い方: node scripts/seed-questions-2.mjs

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_USER_ID = "cmn7a7w4k0000c1yoknlpggfp";

function randomRecentDate(daysAgo = 14) {
  const now = Date.now();
  const ms = Math.floor(Math.random() * daysAgo * 24 * 60 * 60 * 1000);
  return new Date(now - ms).toISOString();
}

const questions = [
  {
    title: "基礎練習をしていても「いい練習ができた」という手ごたえがつかめません。何を基準に質を判断すればいいですか？",
    content:
      "ロングトーンやスケール、リップスラーなどの基礎練習を毎日こなしているのですが、「なんとなくこなしている」感覚が抜けず、練習の質を実感できない日が続いています。時間をかけているのに上達しているのかどうかもわからず、モチベーションの維持も難しくなってきました。「今日はいい練習ができた」と感じる基準や、普段の基礎練習で意識していること・大切にしていることを教えていただけますか？",
    category: "メンタル・考え方・向き合い方",
    level: "beginner",
    status: "approved",
    createdAt: randomRecentDate(10),
  },
  {
    title: "ハイB♭（上第2線のシ♭）が壁になっています。中音域から高音域に移行するために意識すべきことを教えてください",
    content:
      "トランペットを始めて1年ほどです。チューニングB♭より上の音はある程度出せますが、ハイB♭になると急に音がひっくり返ったり詰まって出なくなったりします。「息のスピードを上げる」と意識しているのですが、それだけでは解決しない感覚があります。ハイB♭までの音域を安定させるためのアプローチ、効果的な練習方法、意識すると変わるポイントを教えていただけると助かります。",
    category: "ハイトーン",
    level: "beginner",
    status: "approved",
    createdAt: randomRecentDate(8),
  },
  {
    title: "演奏の実力が大きく伸びた「ターニングポイント」を教えてください。その前後でどんな感覚の変化がありましたか？",
    content:
      "長い停滞期の後に突然「壁を突き破れた」と感じる瞬間があると先輩から聞き、自分にもそういう経験があるのか気になっています。経験豊富な方に、実力が大きくジャンプしたと実感した時期と、そのきっかけになった練習・意識・できごとを教えていただきたいです。またその前後で「音の感覚」や「吹いている感覚」がどう変わったか、具体的なエピソードも聞かせていただけると嬉しいです。",
    category: "メンタル・考え方・向き合い方",
    level: "intermediate",
    status: "approved",
    createdAt: randomRecentDate(5),
  },
  {
    title: "タンギングの発音が荒れてしまい、音の粒立ちがそろいません。クリアな発音を作るために意識していることを教えてください",
    content:
      "基礎練習でタンギングを練習しているのですが、テンポが上がると「タタタ」が「バババ」のように荒れた音になってしまいます。特にアタックの瞬間に雑音が混じったり、音量がそろわなかったりすることが悩みです。舌の動かし方・息とのタイミング・口腔内の形など、クリアなタンギングを作るために意識していること、普段やっている練習、効果があったメソッドを教えてください。",
    category: "タンギング・発音",
    level: "beginner",
    status: "approved",
    createdAt: randomRecentDate(3),
  },
  {
    title: "低音域（チューニングB♭より下）が不安定で音がかすれます。低音を安定させるアプローチや練習法を教えてください",
    content:
      "高音の練習に偏りがちで低音域の扱いが苦手です。チューニングB♭より下の音になるとアンブシュアが崩れるのか、音がかすれたりペラペラになったりしてしまいます。アンサンブルでペダルトーンや低音パートを担当する場面で特に困っています。低音域に対する考え方・意識のポイント、おすすめの練習方法を教えていただけますか？",
    category: "ロートーン",
    level: "beginner",
    status: "approved",
    createdAt: randomRecentDate(6),
  },
  {
    title: "今まで受けたアドバイスで一番印象に残っているものを教えてください。それが演奏にどう生きましたか？",
    content:
      "先生やプロ奏者・先輩から受けたアドバイスの中に、「これは今でも自分の核になっている」と感じる言葉や教えはありますか？ひとことのシンプルなものでも、丁寧な説明でも構いません。そのアドバイスをもらった背景、実際にどう意識・実践したのか、練習への向き合い方や演奏がどう変わったのかを、ぜひ聞かせていただけると嬉しいです。",
    category: "メンタル・考え方・向き合い方",
    level: "intermediate",
    status: "approved",
    createdAt: randomRecentDate(2),
  },
  {
    title: "ハイC以上の音域を安定して出すために、どんな練習とアプローチを積み重ねてきましたか？",
    content:
      "ハイB♭まではある程度コントロールできるようになってきましたが、ハイCから上になると途端に再現性がなくなります。気合いで出せることはあっても、本番で確実に狙いにいけるレベルにはほど遠い状態です。ハイC以上の音域を安定させるために普段どのような練習を積んでいるか、「出す」から「コントロールする」に変わっていく過程でどんな意識の変化があったかを教えていただけますか？",
    category: "ハイトーン",
    level: "advanced",
    status: "approved",
    createdAt: randomRecentDate(4),
  },
  {
    title: "マウスピース選びで迷い続けています。「自分に合った1本」を見つけるための考え方や判断基準を教えてください",
    content:
      "奏法が変わるたびに「今のマウスピースが合っていないのかも」と感じてしまい、何本も試し続けている状態です。試奏では良く感じても、しばらく使うと別の問題が出てきたり、結局元のマウスピースに戻したくなったりします。最終的に「これだ」と思える1本に落ち着いたご経験のある方に、選ぶ際の基準・考え方や、マウスピース沼から抜け出すきっかけを教えていただきたいです。",
    category: "楽器・マウスピース",
    level: "intermediate",
    status: "approved",
    createdAt: randomRecentDate(7),
  },
  {
    title: "おすすめの音程・ソルフェージュのトレーニングを教えてください。「ハマった」ときの感覚も聞かせてください",
    content:
      "アンサンブルやオーケストラで「音程が悪い」と指摘されることが多く、自分の耳が正しい音程を認識できていないのかもしれないと感じています。楽器を持たないソルフェージュ練習やチューナーを使った練習など試していますが、どれが本当に効いているのかわかりません。実際に音程感覚が磨かれたと感じた練習方法と、「正しい音程で吹けている」ときの感覚・コツを教えていただけると嬉しいです。",
    category: "音程・ソルフェージュ",
    level: "intermediate",
    status: "approved",
    createdAt: randomRecentDate(9),
  },
  {
    title: "【メジャー教本シリーズ：アーバン】今から始めるとしたら、どう取り組みますか？効果的な使い方を教えてください",
    content:
      "トランペット奏者のバイブルとも言われるアーバンですが、膨大な練習曲の量にどこから手をつけてよいかわからず、ただ順番にこなしているだけになってしまっています。「楽器を始めた頃に戻れたとしたら」という視点で、アーバンとの向き合い方・優先して取り組むべき箇所・練習の深め方を教えていただけると助かります。プロや上級者の方ならではの使い方があれば、ぜひ聞かせてください。",
    category: "エチュード・オケスタ",
    level: "intermediate",
    status: "approved",
    createdAt: randomRecentDate(11),
  },
  {
    title: "長時間の演奏や本番後半でバテないスタミナをつけるには？プロの方の日々のトレーニングを教えてください",
    content:
      "合奏中や本番の後半になると唇のコントロールが失われ、音量・音程ともに崩れていきます。練習中はある程度吹けていても、本番の緊張や集中力の消費が重なると特に顕著です。プロの方々は日頃どのようなトレーニングでスタミナを維持・強化しているのか、また「バテにくい吹き方」として意識されていることがあればぜひ教えていただきたいです。",
    category: "呼吸・身体・奏法",
    level: "intermediate",
    status: "approved",
    createdAt: randomRecentDate(13),
  },
  {
    title: "最も影響を受けた演奏・録音を教えてください。「必聴ポイント」も一緒に紹介していただけると嬉しいです（3つまで）",
    content:
      "トランペットを続ける中で、「この演奏に出会って吹き方が変わった」「ここから大きな影響を受けた」と感じた演奏・録音はありますか？CDや配信音源、YouTubeなどなんでも構いません。作品名・演奏者とあわせて「ここを聴いてほしい」というポイントや、その演奏があなたにどんな影響を与えたかも教えていただけると、聴く側としてもより深く楽しめそうで嬉しいです。",
    category: "音源・動画",
    level: "intermediate",
    status: "approved",
    createdAt: randomRecentDate(12),
  },
];

async function main() {
  console.log(`Inserting ${questions.length} questions...`);

  const rows = questions.map((q) => ({ ...q, userId: ADMIN_USER_ID }));

  const { data, error } = await supabase
    .from("Question")
    .insert(rows)
    .select("id, title");

  if (error) {
    console.error("Insert error:", error);
    process.exit(1);
  }

  console.log("Inserted:");
  data.forEach((q) => console.log(`  [${q.id}] ${q.title.slice(0, 60)}`));
  console.log("Done.");
}

main();
