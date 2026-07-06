import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Issue } from '@/lib/issues';
import { frontierReadingMinutes } from '@/lib/issues';
import SourceLinks from '@/components/SourceLinks';

export default function FrontierFeature({ issue }: { issue: Issue }) {
  const fr = issue.frontier;
  return (
    <section id="frontier" className="anchor-target mt-14">
      <div className="rounded-[3px] border border-rule bg-surface px-5 py-7 sm:px-10 sm:py-9">
        <div className="mb-5 flex items-baseline justify-between gap-3 border-b-2 border-ink-strong pb-2">
          <p className="text-[11px] font-bold tracking-[0.3em] text-accent">
            深掘り <span className="font-normal text-muted">FRONTIER</span>
          </p>
          <span className="shrink-0 text-[11px] text-muted">
            読了 約{frontierReadingMinutes(issue)}分
          </span>
        </div>

        <h2 className="tracking-palt font-serif text-2xl font-bold leading-[1.45] text-ink-strong sm:text-3xl">
          {fr.title}
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">{fr.dek}</p>
        {fr.tags && fr.tags.length > 0 && (
          <p className="mt-2 text-[10.5px] tracking-wider text-muted">{fr.tags.join(' / ')}</p>
        )}

        <div className="frontier-prose prose mt-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{fr.body_md}</ReactMarkdown>
        </div>

        <div className="mt-8">
          <SourceLinks sources={fr.sources} />
        </div>
      </div>
    </section>
  );
}
