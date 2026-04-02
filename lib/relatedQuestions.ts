export type RelatedQuestion = {
  id: number;
  title: string;
  category: string;
  level: string;
  views: number;
  thumbnail?: string | null;
  _count: { answers: number };
};

type Target = {
  id: number;
  title: string;
  content: string;
  category: string;
  level: string;
};

/**
 * 日本語タイトルから 3〜5 文字の n-gram セットを生成する。
 * トークナイザー不要で意味的重複を検出できる。
 */
function buildNgrams(text: string): Set<string> {
  const result = new Set<string>();
  const clean = text.replace(/[　\s。、・「」【】（）()？?！!…]/g, "");
  for (let len = 3; len <= 5; len++) {
    for (let i = 0; i <= clean.length - len; i++) {
      result.add(clean.slice(i, i + len));
    }
  }
  return result;
}

function scoreRelated(
  target: Target,
  candidate: RelatedQuestion & { content: string }
): number {
  let score = 0;

  // ① カテゴリ一致（最強シグナル）
  if (candidate.category === target.category) score += 50;

  // ② 難易度一致
  if (candidate.level === target.level) score += 15;

  // ③ タイトル n-gram 重複（日本語キーワードマッチ）
  const targetNgrams = buildNgrams(target.title);
  const candidateText = candidate.title + candidate.content.slice(0, 300);
  let kwMatches = 0;
  for (const ng of targetNgrams) {
    if (candidateText.includes(ng)) kwMatches++;
  }
  score += Math.min(kwMatches * 2, 25);

  // ④ 回答あり（内容が充実した質問を優先）
  if (candidate._count.answers > 0) score += 7;

  // ⑤ 閲覧数（人気度、log スケールで上限を設ける）
  score += Math.min(Math.log10(candidate.views + 1) * 4, 8);

  return score;
}

/**
 * 候補リストから関連度スコア上位 `count` 件を返す。
 * 同一質問は自動的に除外される。
 */
export function getRelatedQuestions(
  target: Target,
  candidates: (RelatedQuestion & { content: string })[],
  count = 4
): RelatedQuestion[] {
  return candidates
    .filter((c) => c.id !== target.id)
    .map((c) => ({ candidate: c, score: scoreRelated(target, c) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ candidate }) => candidate);
}
