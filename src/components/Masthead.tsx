import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { formatDateJa } from '@/lib/issues';

interface Props {
  /** 号の発行日(YYYY-MM-DD)。アーカイブ等では省略 */
  date?: string;
  edition?: number;
  generatedAt?: string;
  mastheadNote?: string;
  readingLabel?: string;
}

function generatedTime(iso?: string): string | null {
  if (!iso) return null;
  const m = iso.match(/T(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : null;
}

export default function Masthead({ date, edition, generatedAt, mastheadNote, readingLabel }: Props) {
  const time = generatedTime(generatedAt);
  return (
    <header>
      {/* 最上段: 日付・ナビ */}
      <div className="flex items-center justify-between border-b border-rule py-2 text-[11px] tracking-wider text-muted">
        <span>{date ? `${formatDateJa(date)} 朝刊` : '経済と最先端技術の朝刊'}</span>
        <span className="flex items-center gap-3">
          <Link href="/archive/" className="transition-colors hover:text-accent">
            アーカイブ
          </Link>
          <ThemeToggle />
        </span>
      </div>

      {/* 題字 */}
      <div className="py-6 text-center sm:py-8">
        <Link href="/" className="inline-block">
          <h1 className="tracking-palt font-serif text-5xl font-extrabold tracking-[0.28em] text-ink-strong [text-indent:0.28em] sm:text-6xl">
            朝報
          </h1>
        </Link>
        <p className="mt-3 text-[10px] tracking-[0.42em] text-muted [text-indent:0.42em]">
          経済と最先端技術の朝刊
        </p>
      </div>

      {/* 二重罫線(新聞の題字下罫) */}
      <div className="border-t-2 border-ink-strong" />
      <div className="mt-[3px] border-t border-ink-strong/60" />

      {/* 号情報 */}
      {(edition || time || readingLabel) && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2 text-[11px] tracking-wide text-muted">
          <span>
            {edition ? `第${edition}号` : ''}
            {time ? `　·　${time} 生成` : ''}
            {'　·　Codex 編集'}
          </span>
          {readingLabel && <span>{readingLabel}</span>}
        </div>
      )}
      {mastheadNote && (
        <p className="border-t border-rule py-2 text-center font-serif text-[13px] text-muted">
          {mastheadNote}
        </p>
      )}
    </header>
  );
}
