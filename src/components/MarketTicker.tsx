import type { Issue } from '@/lib/issues';

const ARROW = { up: '▲', down: '▼', flat: '―' } as const;
const COLOR = { up: 'text-up', down: 'text-down', flat: 'text-muted' } as const;

export default function MarketTicker({ snapshot }: { snapshot: Issue['market_snapshot'] }) {
  const notes = snapshot.items.filter((item) => item.note?.trim());
  return (
    <div className="border-b border-rule py-3">
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {snapshot.items.map((m) => (
          <div
            key={m.label}
            className="flex shrink-0 items-baseline gap-2 rounded-sm border border-rule bg-surface px-3 py-1.5"
          >
            <span className="text-[10.5px] text-muted">{m.label}</span>
            <span className="tabular text-[13px] font-semibold text-ink-strong">{m.value}</span>
            <span className={`tabular text-[11px] font-medium ${COLOR[m.direction]}`}>
              {ARROW[m.direction]}
              {m.change ? ` ${m.change}` : ''}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-right text-[10px] text-muted">{snapshot.as_of}</p>
      {notes.length > 0 && (
        <details className="mt-2 text-[11px] text-muted">
          <summary className="w-fit cursor-pointer rounded-sm py-2 font-medium underline decoration-dotted underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            指標の注記・比較時点 ({notes.length}件)
          </summary>
          <dl className="mt-1 space-y-2 border-l-2 border-rule pl-3 leading-relaxed">
            {notes.map((item) => (
              <div key={item.label}>
                <dt className="font-medium text-ink-strong">{item.label}</dt>
                <dd className="break-words">{item.note}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </div>
  );
}

