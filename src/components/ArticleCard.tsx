import type { Article } from '@/lib/issues';
import SourceLinks from '@/components/SourceLinks';

function ImportanceBadge({ level }: { level: 1 | 2 | 3 }) {
  if (level === 3)
    return (
      <span className="inline-block bg-accent px-2 py-0.5 text-[10px] font-bold tracking-widest text-paper">
        最重要
      </span>
    );
  if (level === 2)
    return (
      <span className="inline-block border border-accent px-2 py-0.5 text-[10px] font-bold tracking-widest text-accent">
        重要
      </span>
    );
  return (
    <span className="inline-block border border-rule px-2 py-0.5 text-[10px] tracking-widest text-muted">
      注目
    </span>
  );
}

function BlockLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-[10.5px] font-bold tracking-[0.2em] text-muted">{children}</p>
  );
}

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article
      id={article.id}
      className="anchor-target flex flex-col gap-3.5 rounded-[3px] border border-rule bg-surface p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <ImportanceBadge level={article.importance} />
        {article.tags && article.tags.length > 0 && (
          <span className="truncate text-[10.5px] tracking-wider text-muted">
            {article.tags.join(' / ')}
          </span>
        )}
      </div>

      <h3 className="tracking-palt font-serif text-xl font-bold leading-snug text-ink-strong">
        {article.headline}
      </h3>
      {article.dek && (
        <p className="-mt-1 text-[13px] leading-relaxed text-muted">{article.dek}</p>
      )}

      <div>
        <BlockLabel>何が起きたか</BlockLabel>
        <ul className="space-y-1.5">
          {article.facts.map((f, i) => (
            <li key={i} className="flex gap-2 text-[13.5px] leading-[1.85]">
              <span aria-hidden className="mt-[0.72em] block h-[3px] w-[3px] shrink-0 rounded-full bg-ink" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-l-2 border-accent pl-3.5">
        <BlockLabel>なぜ重要か</BlockLabel>
        <p className="text-[13.5px] leading-[1.85]">{article.why_it_matters}</p>
      </div>

      {article.implications && (
        <div className="border-l-2 border-rule pl-3.5">
          <BlockLabel>示唆</BlockLabel>
          <p className="text-[13.5px] leading-[1.85]">{article.implications}</p>
        </div>
      )}

      <div className="mt-auto">
        <SourceLinks sources={article.sources} />
      </div>
    </article>
  );
}
