import type { Issue } from '@/lib/issues';

const ARROW = { up: '▲', down: '▼', flat: '―' } as const;
const COLOR = { up: 'text-up', down: 'text-down', flat: 'text-muted' } as const;

export default function MarketTicker({ snapshot }: { snapshot: Issue['market_snapshot'] }) {
  return (
    <div className="border-b border-rule py-3">
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {snapshot.items.map((m) => (
          <div
            key={m.label}
            className="flex shrink-0 items-baseline gap-2 rounded-sm border border-rule bg-surface px-3 py-1.5"
            title={m.note}
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
    </div>
  );
}
