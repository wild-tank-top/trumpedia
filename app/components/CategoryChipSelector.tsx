"use client";

import { CATEGORIES } from "@/lib/constants";

const MAX = 3;

export default function CategoryChipSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(cat: string) {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat));
    } else if (selected.length < MAX) {
      onChange([...selected, cat]);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isSelected = selected.includes(cat);
          const isDisabled = !isSelected && selected.length >= MAX;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => toggle(cat)}
              disabled={isDisabled}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                isSelected
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                  : isDisabled
                  ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-600 border-gray-300 hover:border-teal-400 hover:text-teal-600"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {selected.length === 0 ? (
          <span className="text-red-400">1つ以上選択してください</span>
        ) : (
          <span>
            <span className={selected.length >= MAX ? "text-teal-600 font-medium" : "text-gray-500"}>
              {selected.length}
            </span>
            <span className="text-gray-400"> / {MAX} 選択中</span>
          </span>
        )}
      </p>
    </div>
  );
}
