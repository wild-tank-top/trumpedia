"use client";

import { useRouter, usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";

export default function CategoryFilter({ current }: { current?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function select(cat: string | null) {
    if (cat) {
      router.push(`${pathname}?category=${encodeURIComponent(cat)}`);
    } else {
      router.push(pathname);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 mb-5">
      <button
        onClick={() => select(null)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          !current
            ? "bg-teal-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        すべて
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => select(cat)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            current === cat
              ? "bg-teal-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
