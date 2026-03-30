"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X, Loader2 } from "lucide-react";

export default function SearchBox({ initialValue }: { initialValue: string }) {
  const [value, setValue]       = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  const router       = useRouter();
  const searchParams = useSearchParams();

  function submit(q: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) {
      params.set("q", q.trim());
    } else {
      params.delete("q");
    }
    params.delete("page"); // 検索のたびに1ページ目へ
    startTransition(() => {
      router.push("/?" + params.toString());
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(value);
  }

  function handleClear() {
    setValue("");
    submit("");
  }

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div className="relative">
        {isPending ? (
          <Loader2
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 animate-spin"
          />
        ) : (
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="タイトル・内容でキーワード検索…"
          className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition-shadow"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="クリア"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </form>
  );
}
