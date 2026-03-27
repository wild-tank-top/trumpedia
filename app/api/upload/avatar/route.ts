import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin, AVATAR_BUCKET, MAX_AVATAR_SIZE } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  // ── 認証 ─────────────────────────────────────────────
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  // ── FormData パース ───────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "リクエストの解析に失敗しました" }, { status: 400 });
  }

  const file = formData.get("file");
  // フォームで targetUserId を渡した場合は admin が他ユーザーを更新できる
  const targetUserId = (formData.get("userId") as string | null) ?? session.user.id;

  // ── 認可チェック ──────────────────────────────────────
  if (targetUserId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  // ── ファイル検証 ──────────────────────────────────────
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "画像ファイル（JPG / PNG / WebP 等）を選択してください" },
      { status: 400 }
    );
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return NextResponse.json(
      { error: "ファイルサイズは2MB以下にしてください" },
      { status: 400 }
    );
  }

  // ── Supabase Storage アップロード ─────────────────────
  let imageUrl: string;
  try {
    const supabase = getSupabaseAdmin();
    const buffer = Buffer.from(await file.arrayBuffer());
    // 固定パス（拡張子なし）で upsert → ユーザーごとに1ファイルだけ保持
    const storagePath = `${targetUserId}/avatar`;

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[upload/avatar] Supabase upload error:", uploadError);
      return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
    }

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(storagePath);
    // クエリパラメータでブラウザキャッシュをバスト
    imageUrl = `${data.publicUrl}?v=${Date.now()}`;
  } catch (err) {
    console.error("[upload/avatar] unexpected error:", err);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }

  // ── DB 更新（Prisma） ─────────────────────────────────
  try {
    await prisma.user.update({
      where: { id: targetUserId },
      data: { image: imageUrl },
    });
  } catch (err) {
    console.error("[upload/avatar] DB update error:", err);
    return NextResponse.json({ error: "DB の更新に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ image: imageUrl });
}
