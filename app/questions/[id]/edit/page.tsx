import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import EditQuestionForm from "./EditQuestionForm";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, question] = await Promise.all([
    auth(),
    prisma.question.findUnique({ where: { id: Number(id) } }),
  ]);

  if (!question) notFound();
  if (!session) redirect("/login");

  if (session.user.id !== question.userId && session.user.role !== "admin") {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <EditQuestionForm question={question} />
    </div>
  );
}
