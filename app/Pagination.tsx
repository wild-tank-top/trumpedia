import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  currentPage: number;
  totalPages:  number;
  buildHref:   (page: number) => string;
};

/** 表示するページ番号列を生成（省略は "..." で表現） */
function pageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | "...")[] = [1];
  if (current > 3) items.push("...");
  const lo = Math.max(2, current - 1);
  const hi = Math.min(total - 1, current + 1);
  for (let p = lo; p <= hi; p++) items.push(p);
  if (current < total - 2) items.push("...");
  items.push(total);
  return items;
}

const btn =
  "inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors";

export default function Pagination({ currentPage, totalPages, buildHref }: Props) {
  if (totalPages <= 1) return null;

  const prevHref = currentPage > 1         ? buildHref(currentPage - 1) : null;
  const nextHref = currentPage < totalPages ? buildHref(currentPage + 1) : null;

  const NavBtn = ({
    href, children, label,
  }: {
    href: string | null;
    children: React.ReactNode;
    label: string;
  }) =>
    href ? (
      <Link href={href} aria-label={label}
        className={`${btn} border border-gray-200 bg-white text-gray-600 hover:bg-gray-50`}>
        {children}
      </Link>
    ) : (
      <span aria-disabled className={`${btn} border border-gray-100 text-gray-300 cursor-not-allowed`}>
        {children}
      </span>
    );

  return (
    <nav aria-label="ページネーション" className="mt-10 flex items-center justify-center gap-1.5">
      <NavBtn href={prevHref} label="前のページ">
        <ChevronLeft size={16} />
      </NavBtn>

      {/* ── PC：ページ番号リスト ── */}
      <div className="hidden sm:flex items-center gap-1">
        {pageRange(currentPage, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`el-${i}`} className="w-9 text-center text-gray-400 text-sm select-none">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`${btn} ${
                p === currentPage
                  ? "bg-teal-600 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </Link>
          )
        )}
      </div>

      {/* ── モバイル：ページインジケーター ── */}
      <span className="sm:hidden text-sm text-gray-500 px-2 select-none">
        {currentPage} / {totalPages} ページ
      </span>

      <NavBtn href={nextHref} label="次のページ">
        <ChevronRight size={16} />
      </NavBtn>
    </nav>
  );
}
