/**
 * 50音ソート・フィルタリングのためのユーティリティ
 *
 * 判定ロジック:
 *  1. yomi（よみ）が設定されている場合 → yomi の先頭文字で判定（最も正確）
 *  2. yomi 未設定で name がひらがな/カタカナで始まる場合 → name の先頭文字で判定
 *  3. 上記以外（漢字など）→ "その他" に分類
 */

// ── 50音行の定義 ────────────────────────────────────────────────
export const GOJUON_ROWS = [
  { key: "あ", label: "あ" },
  { key: "か", label: "か" },
  { key: "さ", label: "さ" },
  { key: "た", label: "た" },
  { key: "な", label: "な" },
  { key: "は", label: "は" },
  { key: "ま", label: "ま" },
  { key: "や", label: "や" },
  { key: "ら", label: "ら" },
  { key: "わ", label: "わ" },
] as const;

export type GojuonRowKey = (typeof GOJUON_ROWS)[number]["key"] | "その他";

export const ALL_ROW_KEY = "すべて" as const;

// ── 変換ユーティリティ ─────────────────────────────────────────

/** カタカナをひらがなに変換（全角カタカナのみ対応） */
export function toHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0x60)
  );
}

/** 先頭文字がひらがな/カタカナかどうか判定 */
export function isKana(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x3041 && code <= 0x3096) || // ひらがな
    (code >= 0x30a1 && code <= 0x30f6)    // カタカナ
  );
}

// ── 50音行の判定 ──────────────────────────────────────────────

/**
 * ひらがな1文字から50音行のキーを返す
 * 濁音・半濁音は清音の行に含める（が→か行、ぱ→は行 等）
 */
function hiraganaToRowKey(h: string): GojuonRowKey {
  const code = h.charCodeAt(0);

  // あ行: ぁあぃいぅうぇえぉお (U+3041-U+304A)
  if (code >= 0x3041 && code <= 0x304a) return "あ";
  // か行: かがきぎくぐけげこご (U+304B-U+3054)
  if (code >= 0x304b && code <= 0x3054) return "か";
  // さ行: さざしじすずせぜそぞ (U+3055-U+305E)
  if (code >= 0x3055 && code <= 0x305e) return "さ";
  // た行: たっだちぢつづてでとど (U+305F-U+3069)
  if (code >= 0x305f && code <= 0x3069) return "た";
  // な行: なにぬねの (U+306A-U+306E)
  if (code >= 0x306a && code <= 0x306e) return "な";
  // は行: はばぱひびぴふぶぷへべぺほぼぽ (U+306F-U+307D)
  if (code >= 0x306f && code <= 0x307d) return "は";
  // ま行: まみむめも (U+307E-U+3082)
  if (code >= 0x307e && code <= 0x3082) return "ま";
  // や行: ゃやゅゆょよ (U+3083-U+3088)
  if (code >= 0x3083 && code <= 0x3088) return "や";
  // ら行: らりるれろ (U+3089-U+308D)
  if (code >= 0x3089 && code <= 0x308d) return "ら";
  // わ行: ゎわゐゑをん (U+308E-U+3093)
  if (code >= 0x308e && code <= 0x3093) return "わ";

  return "その他";
}

/**
 * 名前のよみ（または名前）の先頭から50音行キーを取得する。
 * - yomi が設定されていれば yomi を使う
 * - ひらがな/カタカナで始まる文字列はそのまま判定
 * - 漢字等は "その他" を返す
 *
 * @param yomi  プロフィールに設定したよみ（ひらがな推奨）
 * @param name  表示名（fallback）
 */
export function getGojuonRowKey(yomi: string, name: string): GojuonRowKey {
  // yomi が設定されていればそちらを優先
  const source = yomi.trim() || name.trim();
  if (!source) return "その他";

  const first = toHiragana(source)[0];
  if (!isKana(source[0]) && !isKana(toHiragana(source)[0])) return "その他";

  return hiraganaToRowKey(first);
}

/**
 * fellows 一覧をよみ → 名前の順で日本語ソートする。
 * Intl.Collator("ja") を使用してひらがな・カタカナ・漢字混在でも適切に並ぶ。
 */
export function sortByYomi<T extends { yomi: string; name: string | null }>(
  items: T[]
): T[] {
  const col = new Intl.Collator("ja", { sensitivity: "base" });
  return [...items].sort((a, b) => {
    const aKey = a.yomi || a.name || "";
    const bKey = b.yomi || b.name || "";
    return col.compare(aKey, bKey);
  });
}
