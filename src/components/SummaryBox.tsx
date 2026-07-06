import type { SummaryItem } from '@/lib/issues';

export default function SummaryBox({ items }: { items: SummaryItem[] }) {
  return (
    <section id="summary" className="anchor-target mt-6">
      <div className="border-y-2 border-ink-strong bg-surface px-5 py-5 sm:px-7">
        <h2 className="tracking-palt mb-4 flex items-center gap-2 font-serif text-base font-bold text-ink-strong">
          <span className="inline-block h-4 w-1.5 shrink-0 bg-accent" aria-hidden />
          <span className="whitespace-nowrap">今朝の要点</span>
          <span className="ml-1 hidden text-[10px] font-normal tracking-[0.25em] text-muted sm:inline">
            EXECUTIVE SUMMARY
          </span>
        </h2>
        <ol className="space-y-2.5">
          {items.map((s, i) => {
            const body = (
              <span className="text-[14px] leading-relaxed">{s.text}</span>
            );
            return (
              <li key={i} className="flex gap-3">
                <span className="tabular mt-px shrink-0 font-serif text-[13px] font-bold text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {s.ref ? (
                  <a
                    href={`#${s.ref}`}
                    className="group"
                    title="該当記事へ移動"
                  >
                    {body}
                    <span className="ml-1 text-[11px] text-muted transition-colors group-hover:text-accent">
                      ↓
                    </span>
                  </a>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
