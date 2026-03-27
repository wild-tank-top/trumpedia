"use client";

import { useRef, useState } from "react";
import Avatar from "@/app/components/Avatar";

type Props = {
  userId: string;
  currentImage?: string | null;
  name?: string | null;
};

export default function AvatarUpload({ userId, currentImage, name }: Props) {
  const [image, setImage] = useState<string | null | undefined>(currentImage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    const form = new FormData();
    form.append("file", file);
    form.append("userId", userId);

    try {
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: form,
      });

      const json = await res.json();
      if (res.ok) {
        setImage(json.image);
      } else {
        setError(json.error ?? "アップロードに失敗しました");
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar src={image} name={name} size="lg" />
        {loading && (
          <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
            <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
            </svg>
          </div>
        )}
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="text-sm border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {loading ? "アップロード中..." : "画像を変更"}
        </button>
        <p className="text-xs text-gray-400 mt-1">JPG / PNG / WebP・2MB以下</p>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
}
