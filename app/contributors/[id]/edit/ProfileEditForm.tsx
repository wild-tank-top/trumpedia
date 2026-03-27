"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AvatarUpload from "./AvatarUpload";

type ProfileData = {
  name: string;
  bio: string;
  career: string;
  twitter: string;
  youtube: string;
  instagram: string;
  website: string;
};

export default function ProfileEditForm({
  userId,
  currentImage,
  initialData,
}: {
  userId: string;
  currentImage?: string | null;
  initialData: ProfileData;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProfileData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/profile/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push(`/contributors/${userId}`);
      router.refresh();
    } else {
      const json = await res.json();
      setError(json.error ?? "保存に失敗しました");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">プロフィール画像</p>
        <AvatarUpload userId={userId} currentImage={currentImage} name={form.name} />
      </div>

      <Field label="表示名" required>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </Field>

      <Field label="自己紹介" hint="自分の演奏スタイルや強みを書いてください">
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </Field>

      <Field label="経歴" hint="楽団・学歴・師事した奏者など">
        <textarea
          name="career"
          value={form.career}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="X（Twitter）" hint="@なしのユーザー名">
          <input
            name="twitter"
            value={form.twitter}
            onChange={handleChange}
            placeholder="username"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </Field>

        <Field label="Instagram" hint="@なしのユーザー名">
          <input
            name="instagram"
            value={form.instagram}
            onChange={handleChange}
            placeholder="username"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </Field>

        <Field label="YouTube" hint="チャンネルURL">
          <input
            name="youtube"
            value={form.youtube}
            onChange={handleChange}
            placeholder="https://youtube.com/@..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </Field>

        <Field label="Webサイト" hint="個人サイトURL">
          <input
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </Field>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
        >
          {loading ? "保存中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-0.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      {children}
    </div>
  );
}
