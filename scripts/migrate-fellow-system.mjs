// scripts/migrate-fellow-system.mjs
// Fellowsネットワークシステム用テーブルを作成する
// 使い方: node scripts/migrate-fellow-system.mjs

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
  console.log("=== Fellowsネットワーク DBマイグレーション開始 ===\n");

  // InviteCode テーブル
  const { error: e1 } = await supabase.rpc("exec_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS "InviteCode" (
        "id"        TEXT        NOT NULL PRIMARY KEY,
        "code"      TEXT        NOT NULL UNIQUE,
        "issuerId"  TEXT        NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "usedAt"    TIMESTAMPTZ,
        "usedById"  TEXT        REFERENCES "User"("id") ON DELETE SET NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  }).catch(() => ({ error: null }));

  // rpc が無い場合は直接 SQL を実行
  const { error: createIC } = await supabase.from("InviteCode").select("id").limit(1);
  if (createIC?.code === "42P01") {
    console.log("InviteCode テーブルが存在しません。Supabase SQL Editor で以下を実行してください。");
  } else {
    console.log("✓ InviteCode テーブル確認済み");
  }

  const { error: createFA } = await supabase.from("FellowApplication").select("id").limit(1);
  if (createFA?.code === "42P01") {
    console.log("FellowApplication テーブルが存在しません。Supabase SQL Editor で以下を実行してください。");
  } else {
    console.log("✓ FellowApplication テーブル確認済み");
  }

  console.log(`
========================================
Supabase SQL Editor で以下を実行してください：
========================================

CREATE TABLE IF NOT EXISTS "InviteCode" (
  "id"        TEXT        NOT NULL PRIMARY KEY,
  "code"      TEXT        NOT NULL UNIQUE,
  "issuerId"  TEXT        NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "usedAt"    TIMESTAMPTZ,
  "usedById"  TEXT        REFERENCES "User"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "FellowApplication" (
  "id"           TEXT        NOT NULL PRIMARY KEY,
  "applicantId"  TEXT        NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "referrerId"   TEXT        NOT NULL REFERENCES "User"("id"),
  "inviteCodeId" TEXT        NOT NULL UNIQUE REFERENCES "InviteCode"("id"),
  "status"       TEXT        NOT NULL DEFAULT 'pending',
  "referrerNote" TEXT,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updatedAt 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW."updatedAt" = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS fellow_application_updated_at ON "FellowApplication";
CREATE TRIGGER fellow_application_updated_at
  BEFORE UPDATE ON "FellowApplication"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
`);
}

run().catch((e) => { console.error(e); process.exit(1); });
