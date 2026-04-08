"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type State = "idle" | "loading" | "complete";

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<State>("idle");
  const pathKey = pathname + searchParams.toString();
  const prevPath = useRef(pathKey);

  // ルート変更完了を検知
  useEffect(() => {
    if (pathKey !== prevPath.current) {
      prevPath.current = pathKey;
      setState((prev) => (prev === "loading" ? "complete" : "idle"));
    }
  }, [pathKey]);

  // complete → idle クリーンアップ
  useEffect(() => {
    if (state !== "complete") return;
    const t = setTimeout(() => setState("idle"), 400);
    return () => clearTimeout(t);
  }, [state]);

  // リンククリックでローディング開始
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (a.target === "_blank") return;
      if (href.startsWith("http") && !href.startsWith(location.origin)) return;
      setState("loading");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (state === "idle") return null;

  return (
    <div
      className="fixed top-0 inset-x-0 z-[9999] h-[2px] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className={`h-full w-full bg-teal-500 ${
          state === "complete" ? "np-complete" : "np-loading"
        }`}
      />
    </div>
  );
}
