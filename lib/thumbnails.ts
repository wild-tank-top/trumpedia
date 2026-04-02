/** /public/assets/thumbnails/ 内の利用可能なアセット一覧 */
export const THUMBNAIL_ASSETS = [
  "/assets/thumbnails/trumpet-598338.jpg",
  "/assets/thumbnails/trumpet-3403806.jpg",
  "/assets/thumbnails/trumpet-3883792.jpg",
  "/assets/thumbnails/light-1092890.jpg",
  "/assets/thumbnails/fantasy-4629332.jpg",
  "/assets/thumbnails/dresden-63640.jpg",
  "/assets/thumbnails/hildesheim-germany-711006.jpg",
  "/assets/thumbnails/Gemini_Generated_Image_93ti5093ti5093ti.png",
  "/assets/thumbnails/Gemini_Generated_Image_9xy3ph9xy3ph9xy3.png",
  "/assets/thumbnails/Gemini_Generated_Image_b5wf15b5wf15b5wf.png",
  "/assets/thumbnails/Gemini_Generated_Image_uoxqyauoxqyauoxq.png",
  "/assets/thumbnails/Gemini_Generated_Image_vjho38vjho38vjho.png",
  "/assets/thumbnails/Gemini_Generated_Image_w2q3c9w2q3c9w2q3.png",
  "/assets/thumbnails/Gemini_Generated_Image_4yysc44yysc44yys.png",
  "/assets/thumbnails/Gemini_Generated_Image_6znx4o6znx4o6znx.png",
  "/assets/thumbnails/Gemini_Generated_Image_lbc2zjlbc2zjlbc2.png",
  "/assets/thumbnails/Gemini_Generated_Image_oxv1kxoxv1kxoxv1.png",
  "/assets/thumbnails/Gemini_Generated_Image_qoi84nqoi84nqoi8.png",
  "/assets/thumbnails/Gemini_Generated_Image_y1hpo3y1hpo3y1hp.png",
  "/assets/thumbnails/assets001.png",
  "/assets/thumbnails/assets002.png",
  "/assets/thumbnails/assets003.png",
  "/assets/thumbnails/assets004.png",
] as const;

export type ThumbnailAsset = (typeof THUMBNAIL_ASSETS)[number];

/** パスが管理アセットかどうか判定 */
export function isManagedThumbnail(path: string | null | undefined): boolean {
  if (!path) return false;
  return path.startsWith("/assets/thumbnails/");
}

/**
 * 質問IDから決定論的にアセットを自動選択する。
 * 同じIDは常に同じ画像を返す（ランダムではない）。
 */
export function getAutoThumbnail(questionId: number): string {
  return THUMBNAIL_ASSETS[questionId % THUMBNAIL_ASSETS.length];
}
