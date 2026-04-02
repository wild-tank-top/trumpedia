// scripts/reset-stats.mjs
// テスト環境のデータをリセットする（本番公開前に1回だけ実行）
// 使い方: node scripts/reset-stats.mjs

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

async function run() {
  console.log("=== テストデータリセット開始 ===\n");

  // 1. Like を全削除（Answer の FK 参照があるため先に削除）
  const { error: likeErr, count: likeCount } = await supabase
    .from("Like")
    .delete()
    .neq("id", 0)
    .select("id", { count: "exact", head: true });
  if (likeErr) { console.error("Like 削除失敗:", likeErr.message); process.exit(1); }
  console.log(`✓ Like 削除完了`);

  // 2. Answer を全削除
  const { error: answerErr } = await supabase
    .from("Answer")
    .delete()
    .neq("id", 0);
  if (answerErr) { console.error("Answer 削除失敗:", answerErr.message); process.exit(1); }
  console.log(`✓ Answer 削除完了`);

  // 3. Notification を全削除（回答起因の通知も含めてクリア）
  const { error: notifErr } = await supabase
    .from("Notification")
    .delete()
    .neq("id", 0);
  if (notifErr) { console.error("Notification 削除失敗:", notifErr.message); process.exit(1); }
  console.log(`✓ Notification 削除完了`);

  // 4. 全質問の閲覧数を 0 にリセット
  const { error: viewErr, count: viewCount } = await supabase
    .from("Question")
    .update({ views: 0 })
    .neq("id", 0)
    .select("id", { count: "exact", head: true });
  if (viewErr) { console.error("views リセット失敗:", viewErr.message); process.exit(1); }
  console.log(`✓ Question.views → 0 にリセット完了`);

  // 5. 確認：残っているレコード数
  const { count: qCount } = await supabase
    .from("Question")
    .select("id", { count: "exact", head: true });
  const { count: aCount } = await supabase
    .from("Answer")
    .select("id", { count: "exact", head: true });

  console.log(`\n=== リセット完了 ===`);
  console.log(`質問数: ${qCount} 件（変更なし）`);
  console.log(`回答数: ${aCount} 件（0件に削除済み）`);
}

run().catch((e) => { console.error(e); process.exit(1); });
