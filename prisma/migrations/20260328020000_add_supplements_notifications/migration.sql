-- QuestionSupplement: 質問への補足投稿
CREATE TABLE "QuestionSupplement" (
  "id"         SERIAL      PRIMARY KEY,
  "questionId" INTEGER     NOT NULL,
  "content"    TEXT        NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuestionSupplement_questionId_fkey"
    FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Notification: 補足投稿時の回答者向け通知
CREATE TABLE "Notification" (
  "id"         SERIAL       PRIMARY KEY,
  "userId"     TEXT         NOT NULL,
  "questionId" INTEGER      NOT NULL,
  "type"       TEXT         NOT NULL DEFAULT 'supplement',
  "isRead"     BOOLEAN      NOT NULL DEFAULT false,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId")     REFERENCES "User"("id")     ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Notification_questionId_fkey"
    FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Notification_userId_questionId_type_key"
    UNIQUE ("userId", "questionId", "type")
);
