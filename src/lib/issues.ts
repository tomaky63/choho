import fs from 'fs';
import path from 'path';

// ---- 型定義(docs/issue-format.md と scripts/validate-issue.mjs の正本) ----

export type Direction = 'up' | 'down' | 'flat';

export interface MarketItem {
  label: string;
  value: string;
  change?: string;
  direction: Direction;
  note?: string;
}

export interface Source {
  title: string;
  publisher: string;
  url: string;
}

export interface Article {
  id: string;
  headline: string;
  dek?: string;
  importance: 1 | 2 | 3;
  facts: string[];
  why_it_matters: string;
  implications?: string;
  sources: Source[];
  tags?: string[];
}

export type SectionId =
  | 'macro_markets'
  | 'tech_ai'
  | 'business'
  | 'world_geopolitics'
  | 'policy_regulation';

export interface Section {
  id: SectionId;
  articles: Article[];
}

export interface SummaryItem {
  text: string;
  ref?: string; // 記事 id へのアンカー
}

export interface Frontier {
  title: string;
  dek: string;
  tags?: string[];
  reading_minutes?: number;
  body_md: string;
  sources: Source[];
}

export interface WatchItem {
  item: string;
  why: string;
  horizon?: string; // 例: "今週", "7月中", "8月2日まで"
}

export interface Insights {
  implications: string[];
  watchlist: WatchItem[];
}

export interface GlossaryItem {
  term: string;
  reading?: string;
  definition: string;
}

export interface Issue {
  date: string; // YYYY-MM-DD
  edition: number;
  generated_at: string; // ISO 8601
  masthead_note?: string;
  market_snapshot: { as_of: string; items: MarketItem[] };
  executive_summary: SummaryItem[];
  top_story: Article;
  sections: Section[];
  frontier: Frontier;
  insights: Insights;
  glossary: GlossaryItem[];
}

// ---- セクション表示定義 ----

export const SECTION_META: Record<SectionId, { title: string; en: string }> = {
  macro_markets: { title: 'マクロ・市場', en: 'MACRO & MARKETS' },
  tech_ai: { title: 'テクノロジー・AI', en: 'TECHNOLOGY & AI' },
  business: { title: '企業・産業', en: 'BUSINESS & INDUSTRY' },
  world_geopolitics: { title: '国際・地政学', en: 'WORLD & GEOPOLITICS' },
  policy_regulation: { title: '政策・規制', en: 'POLICY & REGULATION' },
};

export const SECTION_ORDER: SectionId[] = [
  'macro_markets',
  'tech_ai',
  'business',
  'world_geopolitics',
  'policy_regulation',
];

// ---- 読み込み ----

const ISSUES_DIR = path.join(process.cwd(), 'content', 'issues');

export function getAllIssues(): Issue[] {
  if (!fs.existsSync(ISSUES_DIR)) return [];
  const files = fs
    .readdirSync(ISSUES_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f));
  const issues = files.map((f) => {
    const raw = fs.readFileSync(path.join(ISSUES_DIR, f), 'utf-8');
    return JSON.parse(raw) as Issue;
  });
  // 新しい順
  return issues.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getLatestIssue(): Issue | null {
  const all = getAllIssues();
  return all[0] ?? null;
}

export function getIssueByDate(date: string): Issue | null {
  const all = getAllIssues();
  return all.find((i) => i.date === date) ?? null;
}

/** 前号・次号(date は新しい順ソート済み前提) */
export function getAdjacentIssues(date: string): { prev: Issue | null; next: Issue | null } {
  const all = getAllIssues();
  const idx = all.findIndex((i) => i.date === date);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: all[idx + 1] ?? null, // 1つ古い号
    next: all[idx - 1] ?? null, // 1つ新しい号
  };
}

// ---- 表示ヘルパー ----

const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'];

/** "2026-07-06" → "2026年7月6日(月)" */
export function formatDateJa(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const wd = WEEKDAYS_JA[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${y}年${m}月${d}日(${wd})`;
}

/** "2026-07-06" → "7月6日" */
export function formatDateShortJa(date: string): string {
  const [, m, d] = date.split('-').map(Number);
  return `${m}月${d}日`;
}

function articleChars(a: Article): number {
  return (
    a.headline.length +
    (a.dek?.length ?? 0) +
    a.facts.join('').length +
    a.why_it_matters.length +
    (a.implications?.length ?? 0)
  );
}

/** 本編の推定読了時間(分)。日本語 550字/分 で概算。 */
export function mainReadingMinutes(issue: Issue): number {
  let chars = issue.executive_summary.reduce((n, s) => n + s.text.length, 0);
  chars += articleChars(issue.top_story);
  for (const sec of issue.sections) {
    for (const a of sec.articles) chars += articleChars(a);
  }
  chars += issue.insights.implications.join('').length;
  chars += issue.insights.watchlist.reduce((n, w) => n + w.item.length + w.why.length, 0);
  chars += issue.glossary.reduce((n, g) => n + g.term.length + g.definition.length, 0);
  return Math.max(1, Math.round(chars / 550));
}

/** 深掘りの推定読了時間(分) */
export function frontierReadingMinutes(issue: Issue): number {
  if (issue.frontier.reading_minutes) return issue.frontier.reading_minutes;
  const chars = issue.frontier.title.length + issue.frontier.dek.length + issue.frontier.body_md.length;
  return Math.max(1, Math.round(chars / 550));
}
