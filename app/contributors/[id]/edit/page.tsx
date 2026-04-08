import { isAdmin, isFellow } from "@/lib/roles";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
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
    select: { id: true, name: true, image: true, role: true, profile: true },
  });

  if (!user) notFound();

  const isSelf = session.user.id === id;
  // 編集機能を使えるのは Fellow 以上（admin系も含む）のみ
  const canEdit = isFellow(session.user.role) || isAdmin(session.user.role);

  // ゲストの場合は退会ボタンのみ表示
  if (!canEdit) {
    return (
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/contributors/${id}`}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ← 戻る
          </Link>
          <h1 className="text-xl font-bold text-gray-900">アカウント設定</h1>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 text-sm text-gray-500">
          <p className="font-medium text-gray-700 mb-1">プロフィール編集について</p>
          <p>プロフィールの編集は Fellows になると利用できます。</p>
        </div>
        {isSelf && (
          <div className="border-t border-gray-200 pt-6">
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
          dream: user.profile?.dream ?? "",
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
