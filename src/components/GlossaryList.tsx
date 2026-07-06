import type { GlossaryItem } from '@/lib/issues';
import SectionHeading from '@/components/SectionHeading';

export default function GlossaryList({ items }: { items: GlossaryItem[] }) {
  return (
    <section>
      <SectionHeading id="glossary" title="今日の用語" en="GLOSSARY" />
      <dl className="grid gap-3 sm:grid-cols-2">
        {items.map((g, i) => (
          <div key={i} className="rounded-[3px] border border-rule bg-surface p-4">
            <dt className="tracking-palt font-serif text-[15px] font-bold text-ink-strong">
              {g.term}
              {g.reading && (
                <span className="ml-2 text-[11px] font-normal text-muted">{g.reading}</span>
              )}
            </dt>
            <dd className="mt-1.5 text-[12.5px] leading-[1.8] text-ink">{g.definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
