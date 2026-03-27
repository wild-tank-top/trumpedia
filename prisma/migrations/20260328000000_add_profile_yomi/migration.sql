-- Add yomi (phonetic reading in hiragana) column to Profile
ALTER TABLE "Profile" ADD COLUMN "yomi" TEXT NOT NULL DEFAULT '';
