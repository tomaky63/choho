import Link from 'next/link';
import type { Issue } from '@/lib/issues';
import { formatDateShortJa } from '@/lib/issues';

export default function IssueNav({ prev, next }: { prev: Issue | null; next: Issue | null }) {
  return (
    <nav className="mt-14 flex items-center justify-between border-t-2 border-ink-strong pt-4 text-[13px]">
      <span>
        {prev ? (
          <Link
            href={`/issues/${prev.date}/`}
            className="text-link underline-offset-[3px] hover:underline"
          >
            ← 前号 {formatDateShortJa(prev.date)}(第{prev.edition}号)
          </Link>
        ) : (
          <span className="text-muted">これが最初の号です</span>
        )}
      </span>
      <Link href="/archive/" className="text-[12px] text-muted transition-colors hover:text-accent">
        アーカイブ
      </Link>
      <span>
        {next ? (
          <Link
            href={`/issues/${next.date}/`}
            className="text-link underline-offset-[3px] hover:underline"
          >
            次号 {formatDateShortJa(next.date)}(第{next.edition}号) →
          </Link>
        ) : (
          <span className="text-muted">最新号</span>
        )}
      </span>
    </nav>
  );
}
