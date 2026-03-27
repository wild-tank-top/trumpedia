-- Question.userId: Restrict → SetNull (質問はユーザー削除後も残す)
ALTER TABLE "Question" DROP CONSTRAINT IF EXISTS "Question_userId_fkey";
ALTER TABLE "Question" ADD CONSTRAINT "Question_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Answer.userId: Restrict → Cascade (ユーザー削除時に回答も削除)
ALTER TABLE "Answer" DROP CONSTRAINT IF EXISTS "Answer_userId_fkey";
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
