import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProfileEditForm from "./ProfileEditForm";

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  // 認可チェック（本人 or admin）
  if (!session) redirect("/login");
  if (session.user.id !== id && session.user.role !== "admin") {
    redirect(`/contributors/${id}`);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, image: true, profile: true },
  });

  if (!user) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">プロフィール編集</h1>
      <ProfileEditForm
        userId={id}
        currentImage={user.image}
        initialData={{
          name: user.name ?? "",
          yomi: user.profile?.yomi ?? "",
          bio: user.profile?.bio ?? "",
          career: user.profile?.career ?? "",
          twitter: user.profile?.twitter ?? "",
          youtube: user.profile?.youtube ?? "",
          instagram: user.profile?.instagram ?? "",
          website: user.profile?.website ?? "",
        }}
      />
    </div>
  );
}
