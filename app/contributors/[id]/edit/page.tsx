import { isAdmin } from "@/lib/roles";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProfileEditForm from "./ProfileEditForm";
import DeleteAccountButton from "./DeleteAccountButton";

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  // 認可チェック（本人 or admin）
  if (!session) redirect("/login");
  if (session.user.id !== id && !isAdmin(session.user.role)) {
    redirect(`/contributors/${id}`);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, image: true, profile: true },
  });

  if (!user) notFound();

  // 本人のみアカウント削除ボタンを表示（管理者は自分のページ以外では表示しない）
  const isSelf = session.user.id === id;

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

      {isSelf && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-sm font-medium text-gray-700 mb-1">危険なゾーン</p>
          <p className="text-xs text-gray-400 mb-3">
            アカウントを削除すると、回答はすべて削除されます。投稿した質問はサイトに残ります。
          </p>
          <DeleteAccountButton />
        </div>
      )}
    </div>
  );
}
