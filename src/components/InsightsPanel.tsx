import type { Insights } from '@/lib/issues';

export default function InsightsPanel({ insights }: { insights: Insights }) {
  return (
    <section id="insights" className="anchor-target mt-14">
      <div className="border-l-4 border-accent bg-accent/[0.06] px-5 py-6 sm:px-7">
        <h2 className="tracking-palt mb-4 font-serif text-base font-bold text-ink-strong">
          今日の示唆
          <span className="ml-2 text-[10px] font-normal tracking-[0.25em] text-muted">
            SO WHAT
          </span>
        </h2>
        <ul className="space-y-2.5">
          {insights.implications.map((s, i) => (
            <li key={i} className="flex gap-2.5 text-[13.5px] leading-[1.85]">
              <span aria-hidden className="mt-[0.6em] shrink-0 text-[8px] text-accent">◆</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>

        <h3 className="mb-3 mt-6 border-t border-accent/30 pt-4 text-[12px] font-bold tracking-[0.2em] text-ink-strong">
          ウォッチリスト <span className="font-normal text-muted">— 今後の注目点</span>
        </h3>
        <ul className="space-y-3">
          {insights.watchlist.map((w, i) => (
            <li key={i} className="text-[13.5px] leading-relaxed">
              <div className="flex flex-wrap items-baseline gap-x-2">
                {w.horizon && (
                  <span className="shrink-0 rounded-full border border-accent/60 px-2 py-px text-[10px] font-medium text-accent">
                    {w.horizon}
                  </span>
                )}
                <span className="font-medium text-ink-strong">{w.item}</span>
              </div>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{w.why}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
