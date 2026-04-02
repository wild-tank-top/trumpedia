"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X, Loader2 } from "lucide-react";

export default function SearchBox({ initialValue }: { initialValue: string }) {
  const [value, setValue]            = useState(initialValue);
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
    params.delete("page");
    startTransition(() => { router.push("/?" + params.toString()); });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(value);
  }

  function handleClear() {
    setValue("");
    submit("");
  }

  // 入力値をスペース分割してトークンプレビューを表示
  const tokens = value.trim()
    ? value.trim().split(/[\s　]+/).filter(Boolean)
    : [];
  const isMultiToken = tokens.length > 1;

  return (
    <div className="mb-4">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {isPending ? (
            <Loader2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 animate-spin" />
          ) : (
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          )}
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="例：高音 出し方　※スペースで複数ワードのAND検索"
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

      {/* 複数トークン時：AND検索であることをヒント表示 */}
      {isMultiToken && (
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className="text-[11px] text-gray-400">AND検索：</span>
          {tokens.map((t) => (
            <span
              key={t}
              className="text-[11px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
