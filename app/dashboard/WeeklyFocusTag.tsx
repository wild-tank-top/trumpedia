import { Zap } from "lucide-react";
import Link from "next/link";

type FocusCategory = {
  category: string;
  unanswered: number;
  total: number;
} | null;

export default function WeeklyFocusTag({ focus }: { focus: FocusCategory }) {
  if (!focus) return null;

  const ratio = Math.round((focus.unanswered / focus.total) * 100);

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-5 py-3.5">
      <div className="shrink-0 w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center">
        <Zap size={15} className="text-white fill-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-widest">
          Weekly Focus
        </p>
        <p className="text-sm font-bold text-gray-800 mt-0.5">
          #{focus.category}
          <span className="ml-2 text-xs font-normal text-gray-500">
            {focus.unanswered}/{focus.total}件が未回答（{ratio}%）
          </span>
        </p>
      </div>
      <Link
        href={`/?category=${encodeURIComponent(focus.category)}`}
        className="shrink-0 text-xs font-medium text-amber-600 hover:text-amber-800 transition-colors"
      >
        回答する →
      </Link>
    </div>
  );
}
