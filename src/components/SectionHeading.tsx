interface Props {
  id?: string;
  title: string;
  en?: string;
  meta?: string;
}

export default function SectionHeading({ id, title, en, meta }: Props) {
  return (
    <div id={id} className="anchor-target mb-4 mt-12 flex items-baseline justify-between gap-3 border-b-2 border-ink-strong pb-1.5">
      <div className="flex items-baseline gap-3">
        <h2 className="tracking-palt font-serif text-lg font-bold tracking-wide text-ink-strong">
          {title}
        </h2>
        {en && <span className="hidden text-[10px] tracking-[0.25em] text-muted sm:inline">{en}</span>}
      </div>
      {meta && <span className="text-[11px] text-muted">{meta}</span>}
    </div>
  );
}
