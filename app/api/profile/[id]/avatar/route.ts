import { isAdmin } from "@/lib/roles";
/**
 * /api/profile/[id]/avatar
 * 後方互換エンドポイント。実処理は /api/upload/avatar に委譲する。
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin, AVATAR_BUCKET, MAX_AVATAR_SIZE } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }
  if (session.user.id !== id && !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "画像ファイルを選択してください" }, { status: 400 });
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return NextResponse.json({ error: "ファイルサイズは2MB以下にしてください" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = `${id}/avatar`;

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(storagePath, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("[profile/avatar] upload error:", uploadError);
      return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
    }

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(storagePath);
    const imageUrl = `${data.publicUrl}?v=${Date.now()}`;

    await prisma.user.update({ where: { id }, data: { image: imageUrl } });

    return NextResponse.json({ image: imageUrl });
  } catch (err) {
    console.error("[profile/avatar] unexpected error:", err);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
