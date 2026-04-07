import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin, isMasterAdmin } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || !isAdmin(session.user.role)) {
    redirect("/");
  }

  return (
    <div>
      <div className="mb-6 pb-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">管理ページ</h1>
          <p className="text-sm text-gray-500 mt-1">
            ログイン中：{session.user.name}
            {isMasterAdmin(session.user.role) && (
              <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                マスター管理者
              </span>
            )}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
