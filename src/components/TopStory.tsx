import type { Article } from '@/lib/issues';
import SourceLinks from '@/components/SourceLinks';

export default function TopStory({ article }: { article: Article }) {
  return (
    <section id="top" className="anchor-target mt-10">
      <p className="mb-3 text-[11px] font-bold tracking-[0.3em] text-accent">
        今朝の一面 <span className="font-normal text-muted">TOP STORY</span>
      </p>
      <article id={article.id} className="anchor-target">
        <h2 className="tracking-palt font-serif text-[27px] font-bold leading-[1.4] text-ink-strong sm:text-4xl sm:leading-[1.35]">
          {article.headline}
        </h2>
        {article.dek && (
          <p className="mt-3 border-l-2 border-rule pl-3.5 text-[14.5px] leading-relaxed text-muted">
            {article.dek}
          </p>
        )}

        <div className="mt-5 grid gap-5 md:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="mb-1.5 text-[10.5px] font-bold tracking-[0.2em] text-muted">何が起きたか</p>
            <ul className="space-y-2">
              {article.facts.map((f, i) => (
                <li key={i} className="flex gap-2 text-[14px] leading-[1.9]">
                  <span aria-hidden className="mt-[0.75em] block h-[3px] w-[3px] shrink-0 rounded-full bg-ink" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <div className="border-l-2 border-accent pl-3.5">
              <p className="mb-1.5 text-[10.5px] font-bold tracking-[0.2em] text-muted">なぜ重要か</p>
              <p className="text-[14px] leading-[1.9]">{article.why_it_matters}</p>
            </div>
            {article.implications && (
              <div className="border-l-2 border-rule pl-3.5">
                <p className="mb-1.5 text-[10.5px] font-bold tracking-[0.2em] text-muted">示唆</p>
                <p className="text-[14px] leading-[1.9]">{article.implications}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5">
          <SourceLinks sources={article.sources} />
        </div>
      </article>
    </section>
  );
}
