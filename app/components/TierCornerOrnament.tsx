const CORNERS = [
  { pos: "top-0 left-0",     origin: "top left",     deg: 0   },
  { pos: "top-0 right-0",    origin: "top right",    deg: 90  },
  { pos: "bottom-0 right-0", origin: "bottom right", deg: 180 },
  { pos: "bottom-0 left-0",  origin: "bottom left",  deg: -90 },
] as const;

function CornerPaths({ level }: { level: number }) {
  switch (level) {
    case 1: // コーナーブラケット + ダイヤ
      return (
        <>
          <path d="M4 22 L4 4 L22 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 1.5 L6.5 4 L4 6.5 L1.5 4Z" fill="currentColor"/>
        </>
      );
    case 2: // アラベスク – ブラケット + 対称ペタル
      return (
        <>
          <path d="M4 26 L4 4 L26 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="4" cy="4" r="2.5" fill="currentColor"/>
          <path d="M4 14 C10 8 16 11 13 17 C8 14 4 14 4 14Z" fill="currentColor" opacity="0.55"/>
          <path d="M14 4 C8 10 11 16 17 13 C14 8 14 4 14 4Z" fill="currentColor" opacity="0.55"/>
        </>
      );
    case 3: // ボタニカル – 茎 + 4枚の葉
      return (
        <>
          <path d="M4 32 L4 4 L32 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="4" cy="4" r="2" fill="currentColor"/>
          <path d="M4 13 C11 7 17 10 14 17 C8 14 4 13 4 13Z" fill="currentColor" opacity="0.45"/>
          <path d="M4 23 C10 18 15 20 12 26 C7 23 4 23 4 23Z" fill="currentColor" opacity="0.35"/>
          <path d="M13 4 C7 11 10 17 17 14 C14 8 13 4 13 4Z" fill="currentColor" opacity="0.45"/>
          <path d="M23 4 C18 10 20 15 26 12 C23 7 23 4 23 4Z" fill="currentColor" opacity="0.35"/>
        </>
      );
    case 4: // ヴァイン – 曲線の蔓 + 蕾 + 4枚の葉
      return (
        <>
          <path d="M4 36 C4 24 10 12 20 6 C26 3 32 4 36 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M6 30 C13 24 20 27 16 33 C10 30 6 30 6 30Z" fill="currentColor" opacity="0.4"/>
          <path d="M10 20 C17 14 23 17 19 24 C13 21 10 20 10 20Z" fill="currentColor" opacity="0.4"/>
          <path d="M20 8 C14 15 16 22 23 19 C21 12 20 8 20 8Z" fill="currentColor" opacity="0.4"/>
          <path d="M30 4 C24 11 26 18 33 15 C31 8 30 4 30 4Z" fill="currentColor" opacity="0.4"/>
          <circle cx="4" cy="4" r="2.5" fill="currentColor" opacity="0.8"/>
          <path d="M4 4 C7 1 9 3 8 6 C6 5 4 4 4 4Z" fill="currentColor" opacity="0.7"/>
          <path d="M4 4 C1 7 3 9 6 8 C5 6 4 4 4 4Z" fill="currentColor" opacity="0.7"/>
        </>
      );
    case 5: // 月桂冠 – 楕円の葉が並ぶ + 中央のジュエル
      return (
        <>
          <line x1="4" y1="4" x2="36" y2="4" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
          <line x1="4" y1="4" x2="4" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
          <ellipse cx="13" cy="4" rx="8" ry="3.5" transform="rotate(-15 13 4)" fill="currentColor" opacity="0.45"/>
          <ellipse cx="22" cy="4" rx="7" ry="3"   transform="rotate(-8 22 4)"  fill="currentColor" opacity="0.38"/>
          <ellipse cx="30" cy="4" rx="6" ry="2.5" transform="rotate(-3 30 4)"  fill="currentColor" opacity="0.28"/>
          <ellipse cx="4" cy="13" rx="3.5" ry="8" transform="rotate(15 4 13)"  fill="currentColor" opacity="0.45"/>
          <ellipse cx="4" cy="22" rx="3"   ry="7" transform="rotate(8 4 22)"   fill="currentColor" opacity="0.38"/>
          <ellipse cx="4" cy="30" rx="2.5" ry="6" transform="rotate(3 4 30)"   fill="currentColor" opacity="0.28"/>
          <circle cx="4" cy="4" r="4.5" fill="currentColor"/>
          <circle cx="4" cy="4" r="2.2" fill="white" opacity="0.45"/>
        </>
      );
    case 6: // アカンサス・スクロール – 螺旋 + アカンサスの葉
      return (
        <>
          <path d="M4 36 C4 24 8 14 16 8 C22 4 30 3 36 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M36 4 C40 4 40 9 36 12 C32 15 27 12 29 8 C31 5 35 5 36 8" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.8"/>
          <path d="M36 4 C40 4 40 9 36 12 C32 15 27 12 29 8 C31 5 35 5 36 8Z" fill="currentColor" opacity="0.15"/>
          <path d="M4 28 C12 22 19 25 15 32 C9 29 4 28 4 28Z"   fill="currentColor" opacity="0.5"/>
          <path d="M6 19 C14 13 21 16 17 23 C11 20 6 19 6 19Z"   fill="currentColor" opacity="0.45"/>
          <path d="M13 8 C8 16 11 23 18 19 C16 12 13 8 13 8Z"    fill="currentColor" opacity="0.45"/>
          <path d="M23 4 C17 12 20 19 27 15 C25 8 23 4 23 4Z"    fill="currentColor" opacity="0.4"/>
          <path d="M4 33 C8 29 11 31 9 35 C6 34 4 33 4 33Z"      fill="currentColor" opacity="0.65"/>
          <path d="M33 4 C29 8 31 11 35 9 C34 6 33 4 33 4Z"      fill="currentColor" opacity="0.65"/>
          <circle cx="4" cy="4" r="3.5" fill="currentColor"/>
          <circle cx="4" cy="4" r="1.8" fill="white" opacity="0.45"/>
          <path d="M4 0.5 L5.5 2 L4 3.5 L2.5 2Z" fill="white" opacity="0.5"/>
        </>
      );
    default:
      return null;
  }
}

export default function TierCornerOrnament({
  level,
  colorClass,
  size = 36,
}: {
  level: number;
  colorClass: string;
  size?: number;
}) {
  if (level === 0) return null;
  return (
    <>
      {CORNERS.map(({ pos, origin, deg }) => (
        <svg
          key={pos}
          width={size}
          height={size}
          viewBox="0 0 40 40"
          className={`absolute ${pos} ${colorClass} pointer-events-none select-none`}
          style={{ transformOrigin: origin, transform: `rotate(${deg}deg)` }}
          aria-hidden="true"
        >
          <CornerPaths level={level} />
        </svg>
      ))}
    </>
  );
}
