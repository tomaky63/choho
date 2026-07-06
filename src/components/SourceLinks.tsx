import type { Source } from '@/lib/issues';

export default function SourceLinks({ sources }: { sources: Source[] }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-rule/70 pt-2.5 text-[11.5px] leading-relaxed">
      <span className="shrink-0 text-muted">出典</span>
      {sources.map((s, i) => (
        <a
          key={i}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link underline-offset-[3px] hover:underline"
        >
          {s.publisher}
          <span className="text-link/80">「{s.title}」</span>
          <span aria-hidden className="ml-0.5 text-[10px]">↗</span>
        </a>
      ))}
    </div>
  );
}
