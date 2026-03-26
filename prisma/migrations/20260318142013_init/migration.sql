-- CreateTable
CREATE TABLE "Question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "tried" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questionId" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "causeAnalysis" TEXT NOT NULL,
    "thinking" TEXT NOT NULL,
    "approach" TEXT NOT NULL,
    "ngExamples" TEXT NOT NULL,
    "exceptions" TEXT NOT NULL,
    "philosophy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
