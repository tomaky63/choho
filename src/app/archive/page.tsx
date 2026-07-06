import type { Metadata } from 'next';
import Link from 'next/link';
import Masthead from '@/components/Masthead';
import { formatDateJa, getAllIssues } from '@/lib/issues';

export const metadata: Metadata = {
  title: 'アーカイブ',
  description: '朝報の過去の号一覧',
};

export default function ArchivePage() {
  const issues = getAllIssues(); // 新しい順

  // 月ごとにグルーピング
  const byMonth = new Map<string, typeof issues>();
  for (const issue of issues) {
    const month = issue.date.slice(0, 7);
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month)!.push(issue);
  }

  return (
    <>
      <Masthead />
      <main>
        <div className="mb-2 mt-8 border-b-2 border-ink-strong pb-1.5">
          <h2 className="tracking-palt font-serif text-lg font-bold text-ink-strong">
            アーカイブ
            <span className="ml-3 text-[10px] font-normal tracking-[0.25em] text-muted">
              ARCHIVE — 全{issues.length}号
            </span>
          </h2>
        </div>

        {issues.length === 0 && (
          <p className="py-16 text-center text-sm text-muted">まだ号がありません。</p>
        )}

        {[...byMonth.entries()].map(([month, list]) => {
          const [y, m] = month.split('-').map(Number);
          return (
            <section key={month} className="mt-8">
              <h3 className="tabular mb-2 text-[12px] font-bold tracking-[0.15em] text-muted">
                {y}年{m}月
              </h3>
              <ul>
                {list.map((issue) => (
                  <li key={issue.date} className="border-b border-rule">
                    <Link
                      href={`/issues/${issue.date}/`}
                      className="group flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:gap-4"
                    >
                      <span className="tabular shrink-0 text-[12.5px] text-muted sm:w-40">
                        {formatDateJa(issue.date)}
                      </span>
                      <span className="tabular shrink-0 text-[11px] text-muted sm:w-14">
                        第{issue.edition}号
                      </span>
                      <span className="tracking-palt font-serif text-[15px] font-medium leading-snug text-ink-strong underline-offset-4 group-hover:underline">
                        {issue.top_story.headline}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
    </>
  );
}
