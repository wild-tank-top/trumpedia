-- AlterTable: views カラムを追加（既存行は 0 で初期化）
ALTER TABLE "Question" ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0;
