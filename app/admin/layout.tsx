import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// SSRレベルで認証・認可チェック
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div>
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">管理ページ</h1>
        <p className="text-sm text-gray-500 mt-1">
          ログイン中：{session.user.name}（{session.user.email}）
        </p>
      </div>
      {children}
    </div>
  );
}
