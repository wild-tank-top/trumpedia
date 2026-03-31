"use client";

import Image from "next/image";
import { Check, ImageIcon } from "lucide-react";
import { THUMBNAIL_ASSETS } from "@/lib/thumbnails";

type Props = {
  /** 現在選択中のパス。空文字 = 自動（テキストサムネイル） */
  value: string;
  onChange: (path: string) => void;
  /** プレビューに重ねるタイトル */
  previewTitle?: string;
};

export default function ThumbnailPicker({ value, onChange, previewTitle }: Props) {
  return (
    <div className="space-y-3">
      {/* ── プレビューエリア ── */}
      <div
        className={`relative w-full aspect-video rounded-xl overflow-hidden border-2 transition-all ${
          value
            ? "border-teal-300 shadow-sm"
            : "border-dashed border-gray-200 bg-gray-50"
        }`}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt="preview"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 600px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />
            <div className="absolute bottom-3 left-3 right-3">
              {previewTitle ? (
                <p className="text-white font-bold text-sm line-clamp-2 leading-snug drop-shadow">
                  {previewTitle}
                </p>
              ) : (
                <p className="text-white/50 text-sm italic">
                  タイトルを入力するとここに表示されます
                </p>
              )}
            </div>
            {/* 選択中ラベル */}
            <div className="absolute top-2 right-2 bg-teal-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              選択中
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
            <ImageIcon size={28} />
            <p className="text-xs text-gray-400">画像を選ぶとプレビューが表示されます</p>
          </div>
        )}
      </div>

      {/* ── サムネイル選択グリッド ── */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {/* 「自動」オプション */}
        <button
          type="button"
          onClick={() => onChange("")}
          className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-teal-300 ${
            !value
              ? "border-teal-500 ring-2 ring-teal-200"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="w-full h-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-teal-700">自動</span>
          </div>
          {!value && (
            <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
              <Check size={9} className="text-white" />
            </div>
          )}
        </button>

        {/* 画像アセット一覧 */}
        {THUMBNAIL_ASSETS.map((path) => {
          const isSelected = value === path;
          return (
            <button
              key={path}
              type="button"
              onClick={() => onChange(path)}
              className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-teal-300 ${
                isSelected
                  ? "border-teal-500 ring-2 ring-teal-200"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image
                src={path}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-teal-600/25 flex items-center justify-center">
                  <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center shadow">
                    <Check size={11} className="text-white" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-400">
        「自動」を選ぶと質問IDに基づいてアセットから画像が自動で割り当てられます
      </p>
    </div>
  );
}
