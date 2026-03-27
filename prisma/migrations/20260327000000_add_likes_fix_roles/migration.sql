-- CreateTable (SQLite / local dev)
CREATE TABLE "Like" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "answerId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Like_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_answerId_key" ON "Like"("userId", "answerId");

-- DataFix: "pro" ロールを "fellow" に統一
UPDATE "User" SET "role" = 'fellow' WHERE "role" = 'pro';
