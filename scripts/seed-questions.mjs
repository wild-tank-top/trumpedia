// scripts/seed-questions.mjs
// 使い方: node scripts/seed-questions.mjs

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

// 直近7日間でランダムな日時を生成
function randomRecentDate(daysAgo = 7) {
  const now = Date.now();
  const ms = Math.floor(Math.random() * daysAgo * 24 * 60 * 60 * 1000);
  return new Date(now - ms).toISOString();
}

const questions = [
  {
    title: "スラーで長3度を跳躍するとき、上の音が必ずひっくり返ってしまいます",
    content:
      "トランペット歴2年です。中音域のソから上のシへのスラー（長3度上行）で、シが「ぷっ」とひっくり返ることが多く、特に速いテンポで顕著です。アンブシュアを意識すると余計に緊張してしまいます。息の圧力を変えるのか、口の中の形（舌の位置）を変えるべきなのか、どのように練習すればよいでしょうか。",
    category: "呼吸・身体・奏法",
    level: "beginner",
    status: "approved",
    createdAt: randomRecentDate(6),
  },
  {
    title: "本番直前に唇が震えて息も上手く入らなくなります。どう対処していますか？",
    content:
      "吹奏楽部で3年目です。普段の練習では問題なく吹けているのに、定期演奏会の直前になると唇が細かく震え、ロングトーンすらまともにできなくなります。深呼吸は試しましたが焼け石に水で、本番中ずっと頭が真っ白な状態です。経験豊富な方はどんなルーティンで本番に臨んでいますか？",
    category: "メンタル・考え方・向き合い方",
    level: "beginner",
    status: "approved",
    createdAt: randomRecentDate(2),
  },
  {
    title: "ダブルタンギングを速くすると「タ」と「カ」の粒が不均等になる",
    content:
      "ジャズビッグバンドでリードトランペットを担当しています。BPM160以上のフレーズでダブルタンギングを使うと、「タ」は明瞭なのに「カ」が小さく丸くなってしまいます。「カ」単体でゆっくり練習しても、テンポを上げると途端に崩れます。「カ」の音を鍛えるための具体的な練習メニューを教えてください。",
    category: "タンギング・発音",
    level: "intermediate",
    status: "approved",
    createdAt: randomRecentDate(4),
  },
  {
    title: "ハイBbより上の音域を狙うと息が続かずすぐバテる",
    content:
      "オーケストラのエキストラとして出演する機会が増え、ハイB♭（上第2線のシ♭）以上の音符を長時間吹き続けることが求められるようになりました。単発では出せるのに、曲の中で継続すると30〜40分で唇が機能しなくなります。スタミナを維持するための息の使い方・アンブシュア管理を知りたいです。",
    category: "ハイトーン",
    level: "advanced",
    status: "approved",
    createdAt: randomRecentDate(1),
  },
  {
    title: "楽器を持ち替えたらピストンが重くなり速いパッセージで詰まります",
    content:
      "先日、学生時代から使っていたYAMAHA YTR-2335から、中古のBach Stradivarius 37に買い替えました。音色には満足しているのですが、ピストンの重さに慣れず、16分音符が続くパッセージでピストンが戻り切らずに音がつながってしまいます。新しい楽器に早く慣れるコツや、指のトレーニング方法はありますか？",
    category: "楽器・マウスピース",
    level: "intermediate",
    status: "approved",
    createdAt: randomRecentDate(5),
  },
  {
    title: "音を小さくしようとするとpの音量でピッチが常にフラットになる",
    content:
      "室内楽やアンサンブルでpのダイナミクスを指示されると、音程が安定せず周りの楽器とひどくぶつかってしまいます。息の量を減らすとアンブシュアが緩み、ピッチが下がる一方でmpに戻すとピッチは安定します。小さい音量でも正確な音程を保つための練習法・息の使い方を教えてください。",
    category: "音程・ソルフェージュ",
    level: "intermediate",
    status: "approved",
    createdAt: randomRecentDate(3),
  },
  {
    title: "毎日2時間練習しているのに半年間まったく上達している実感がない",
    content:
      "社会人アマチュアとして週に5日、1日2時間の練習を6ヶ月間継続していますが、録音を聞き返しても半年前と変わっている気がしません。基礎練（ロングトーン・スケール・リップスラー）を中心にやっていますが、何かが根本的に間違っているのかもしれません。停滞を突破するためにどういう視点で練習を見直せばよいでしょうか。",
    category: "メンタル・考え方・向き合い方",
    level: "beginner",
    status: "approved",
    createdAt: randomRecentDate(7),
  },
  {
    title: "フラジオ域（ハイF以上）でアタックするとき音頭が安定しない",
    content:
      "ジャズのソロでフラジオ（ハイF～HighC）を取り入れたいのですが、音の出始めが毎回ギャンブルで、本番でフラジオをフィーチャーするのが怖い状態です。特にフォルテで吹き始めるときにアタックが決まりません。フラジオのアタックを安定させるためのルーティン・コンセプトがあれば教えてください。",
    category: "ハイトーン",
    level: "advanced",
    status: "approved",
    createdAt: randomRecentDate(2),
  },
  {
    title: "マウスピースのリムサイズを変えると音色は変わるが何を基準に選べばいい？",
    content:
      "現在Bach 3Cを使っていますが、知人に「もう少し浅いカップを試してみては」と言われ、1.5Cと7Cを試奏しました。確かに音色が変わるのですが、自分に何が合っているか判断できません。内径・カップの深さ・スロートの違いが演奏にどう影響するか、選択の基準になる考え方を教えてください。",
    category: "楽器・マウスピース",
    level: "beginner",
    status: "approved",
    createdAt: randomRecentDate(5),
  },
  {
    title: "曲の途中に長い休みがあると再び入るタイミングでアンブシュアが固まっている",
    content:
      "オーケストラ曲で50小節以上の休みの後にソロで入る箇所があり、休んでいる間にアンブシュアが完全にほぐれてしまい、入りで唇が震えたり音が裏返ったりします。ブレスのやり直しや指だけで鍵を押さえて待機するなど試しましたが効果がありません。長い休みを挟んだ後の入りを安定させる方法を知りたいです。",
    category: "メンタル・考え方・向き合い方",
    level: "advanced",
    status: "approved",
    createdAt: randomRecentDate(1),
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
  data.forEach((q) => console.log(`  [${q.id}] ${q.title}`));
  console.log("Done.");
}

main();
