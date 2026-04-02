/**
 * 検索ユーティリティ
 * - SYNONYM_GROUPS: サーバー・クライアント両方で使う同義語グループ
 * - expandSearchTerms: クエリをトークン分割 → 各トークンを同義語展開
 */

export const SYNONYM_GROUPS: readonly string[][] = [
  // 高音域
  [
    "高音", "高音域", "高い音", "上の音",
    "ハイトーン", "ハイノート", "ハイC", "ハイBb", "ハイB", "ハイF",
    "ダブルハイ", "フラジオ", "ハイ",
  ],
  // 低音域
  [
    "低音", "低音域", "低い音", "下の音",
    "ローノート", "ロートーン", "ペダル", "ペダルトーン", "ロー",
  ],
  // タンギング・発音
  [
    "タンギング", "tonguing", "舌", "アタック", "発音",
    "ダブルタンギング", "トリプルタンギング",
  ],
  // 呼吸・ブレス
  [
    "呼吸", "ブレス", "息", "腹式", "横隔膜",
    "息継ぎ", "ブレスコントロール",
  ],
  // リップスラー
  [
    "リップスラー", "スラー", "slur", "リップ",
  ],
  // アンブシュア
  [
    "アンブシュア", "embouchure", "口の形", "唇", "くちびる", "口元",
  ],
  // マウスピース
  [
    "マウスピース", "MP", "mouthpiece", "マウス",
  ],
  // 音色・トーン
  [
    "音色", "トーン", "tone", "サウンド", "sound",
  ],
  // ビブラート
  [
    "ビブラート", "vibrato",
  ],
  // スケール・音階
  [
    "スケール", "音階", "調性", "長調", "短調",
  ],
  // ウォームアップ・基礎練習
  [
    "ウォームアップ", "ウォーミングアップ", "基礎練習", "ロングトーン",
    "warm up", "warmup",
  ],
  // メンタル
  [
    "メンタル", "緊張", "本番", "あがり", "プレッシャー",
    "自信", "モチベーション",
  ],
] as const;

/**
 * クエリ文字列をトークン分割し、各トークンを同義語展開する。
 *
 * 例: "ハイトーン 練習" → [["ハイトーン","高音","高音域",...], ["練習"]]
 */
export function expandSearchTerms(query: string): string[][] {
  const tokens = query
    .split(/[\s　]+/) // 全角・半角スペースで分割
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  return tokens.map((token) => {
    const expanded = new Set([token]);
    for (const group of SYNONYM_GROUPS) {
      const hit = group.some(
        (term) => token.includes(term) || term.includes(token)
      );
      if (hit) {
        group.forEach((term) => expanded.add(term));
        break;
      }
    }
    return Array.from(expanded);
  });
}
