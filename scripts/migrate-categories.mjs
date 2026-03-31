// scripts/migrate-categories.mjs
// 使い方: node scripts/migrate-categories.mjs

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

const MIGRATION_MAP = {
  "音色":     "呼吸・身体・奏法",
  "音程":     "音程・ソルフェージュ",
  "テクニック": "呼吸・身体・奏法",
  "メンタル":  "メンタル・考え方・向き合い方",
  "練習法":   "楽曲の練習・解釈",
  "音楽理論":  "音程・ソルフェージュ",
  "楽器選び":  "楽器・マウスピース",
  "その他":   "呼吸・身体・奏法",
};

async function main() {
  console.log("Fetching all questions...");
  const { data: questions, error: fetchError } = await supabase
    .from("Question")
    .select("id, title, category");

  if (fetchError) {
    console.error("Fetch error:", fetchError);
    process.exit(1);
  }

  console.log(`Found ${questions.length} questions.\n`);

  let updated = 0;
  let skipped = 0;

  for (const q of questions) {
    const newCategory = MIGRATION_MAP[q.category];
    if (!newCategory) {
      console.log(`  SKIP [${q.id}] "${q.category}" → (already new or unknown) ${q.title.slice(0, 40)}`);
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("Question")
      .update({ category: newCategory })
      .eq("id", q.id);

    if (updateError) {
      console.error(`  ERROR [${q.id}]:`, updateError);
    } else {
      console.log(`  OK [${q.id}] "${q.category}" → "${newCategory}"`);
      updated++;
    }
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
}

main();
