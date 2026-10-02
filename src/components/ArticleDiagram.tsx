import type { ReactNode } from 'react';
import type {
  ArticleDiagram as DiagramData,
  ComparisonDiagram,
  DiagramStatus,
  RelationshipDiagram,
  TimelineDiagram,
} from '@/lib/issues';

const STATUS_LABEL: Record<DiagramStatus, string> = {
  actual: '実績',
  forecast: '予測',
  context: '参考',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStatus(value: unknown): value is DiagramStatus | undefined {
  return value === undefined || value === 'actual' || value === 'forecast' || value === 'context';
}

export function isRenderableDiagram(value: unknown): value is DiagramData {
  if (!isRecord(value) || !hasText(value.title) || !hasText(value.type)) return false;

  if (value.type === 'comparison') {
    return Array.isArray(value.items)
      && value.items.length >= 2
      && value.items.length <= 8
      && value.items.every((item) => isRecord(item)
        && hasText(item.label)
        && typeof item.value === 'number'
        && Number.isFinite(item.value)
        && (item.display_value === undefined || hasText(item.display_value))
        && isStatus(item.status));
  }

  if (value.type === 'timeline') {
    return Array.isArray(value.items)
      && value.items.length >= 2
      && value.items.length <= 8
      && value.items.every((item) => isRecord(item)
        && hasText(item.date)
        && hasText(item.label)
        && (item.detail === undefined || hasText(item.detail))
        && isStatus(item.status));
  }

  if (value.type === 'relationship') {
    if (!Array.isArray(value.nodes) || value.nodes.length < 2 || value.nodes.length > 6
      || !Array.isArray(value.links) || value.links.length < 1 || value.links.length > 8) return false;
    const ids = new Set<string>();
    for (const node of value.nodes) {
      if (!isRecord(node) || !hasText(node.id) || !/^[a-z0-9-]+$/.test(node.id)
        || ids.has(node.id) || !hasText(node.label)
        || (node.detail !== undefined && !hasText(node.detail))) return false;
      ids.add(node.id);
    }
    return value.links.every((link) => isRecord(link)
      && hasText(link.from)
      && hasText(link.to)
      && link.from !== link.to
      && ids.has(link.from)
      && ids.has(link.to)
      && (link.label === undefined || hasText(link.label)));
  }

  return false;
}

function StatusBadge({ status }: { status?: DiagramStatus }) {
  if (!status) return null;
  const className = status === 'forecast'
    ? 'border-accent/60 text-accent'
    : status === 'context'
      ? 'border-rule text-muted'
      : 'border-ink/30 text-ink';
  return (
    <span className={'inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[9px] font-bold tracking-wider ' + className}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function FigureFrame({ diagram, children }: { diagram: DiagramData; children: ReactNode }) {
  return (
    <figure className="my-5 overflow-hidden rounded-[3px] border border-rule bg-paper/60">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-rule px-4 py-3">
        <span className="font-serif text-[14px] font-bold leading-snug text-ink-strong">
          {diagram.title}
        </span>
        <span className="text-[9.5px] font-bold tracking-[0.18em] text-accent">図解</span>
      </figcaption>
      <div className="px-4 py-4">{children}</div>
      {diagram.note && (
        <p className="border-t border-rule px-4 py-2.5 text-[10.5px] leading-relaxed text-muted">
          {diagram.note}
        </p>
      )}
    </figure>
  );
}

function Comparison({ diagram }: { diagram: ComparisonDiagram }) {
  const values = diagram.items.map((item) => item.value);
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(0, ...values);
  const span = maximum - minimum || 1;
  const zero = (-minimum / span) * 100;

  return (
    <div>
      {diagram.unit && (
        <p className="mb-3 text-right text-[10px] tracking-wide text-muted">単位：{diagram.unit}</p>
      )}
      <ul className="space-y-3">
        {diagram.items.map((item, index) => {
          const rawWidth = Math.abs(item.value) / span * 100;
          const width = item.value === 0 ? 0 : Math.max(rawWidth, 1);
          const left = item.value >= 0 ? zero : zero - width;
          const barClass = item.status === 'forecast'
            ? 'border border-dashed border-accent bg-accent/10'
            : item.status === 'context'
              ? 'bg-muted/45'
              : 'bg-accent/80';
          return (
            <li key={item.label + '-' + index}>
              <div className="mb-1 flex items-center justify-between gap-3 text-[11px] leading-snug">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate">{item.label}</span>
                  <StatusBadge status={item.status} />
                </span>
                <span className="tabular shrink-0 font-bold text-ink-strong">
                  {item.display_value ?? item.value}
                </span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-sm bg-rule/45" aria-hidden="true">
                {minimum < 0 && maximum > 0 && (
                  <span className="absolute inset-y-0 w-px bg-ink/35" style={{ left: zero + '%' }} />
                )}
                <span
                  className={'absolute inset-y-[2px] rounded-sm ' + barClass}
                  style={{ left: left + '%', width: width + '%' }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Timeline({ diagram }: { diagram: TimelineDiagram }) {
  return (
    <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[9px] before:top-2 before:w-px before:bg-rule">
      {diagram.items.map((item, index) => (
        <li key={item.date + '-' + item.label + '-' + index} className="relative pl-7">
          <span className="absolute left-[5px] top-[5px] h-[9px] w-[9px] rounded-full border-2 border-surface bg-accent ring-1 ring-accent/40" aria-hidden="true" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="tabular text-[10px] font-bold tracking-wide text-accent">{item.date}</span>
            <StatusBadge status={item.status} />
          </div>
          <p className="mt-0.5 text-[12px] font-bold leading-relaxed text-ink-strong">{item.label}</p>
          {item.detail && <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{item.detail}</p>}
        </li>
      ))}
    </ol>
  );
}

function Relationship({ diagram }: { diagram: RelationshipDiagram }) {
  const centerX = 340;
  const centerY = 180;
  const positions = new Map(diagram.nodes.map((node, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / diagram.nodes.length;
    return [node.id, {
      x: centerX + Math.cos(angle) * 245,
      y: centerY + Math.sin(angle) * 125,
    }] as const;
  }));
  const nodeById = new Map(diagram.nodes.map((node) => [node.id, node]));

  return (
    <div>
      <svg
        className="h-auto w-full text-rule"
        viewBox="0 0 680 360"
        role="img"
        aria-label={diagram.title + 'の関係図'}
      >
        <g fill="none" stroke="currentColor" strokeWidth="2">
          {diagram.links.map((link, index) => {
            const from = positions.get(link.from);
            const to = positions.get(link.to);
            if (!from || !to) return null;
            return (
              <path
                key={link.from + '-' + link.to + '-' + index}
                d={'M ' + from.x + ' ' + from.y + ' Q ' + centerX + ' ' + centerY + ' ' + to.x + ' ' + to.y}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </g>
        {diagram.nodes.map((node, index) => {
          const point = positions.get(node.id);
          if (!point) return null;
          return (
            <g key={node.id} transform={'translate(' + point.x + ' ' + point.y + ')'}>
              <circle r="28" className="fill-surface stroke-accent" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              <text textAnchor="middle" dominantBaseline="central" className="fill-accent text-[18px] font-bold">
                {index + 1}
              </text>
            </g>
          );
        })}
      </svg>

      <ol className="mt-2 grid gap-2 sm:grid-cols-2">
        {diagram.nodes.map((node, index) => (
          <li key={node.id} className="flex gap-2 rounded-sm border border-rule/80 bg-surface/70 p-2.5">
            <span className="tabular flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-paper">
              {index + 1}
            </span>
            <span>
              <span className="block text-[11px] font-bold leading-relaxed text-ink-strong">{node.label}</span>
              {node.detail && <span className="mt-0.5 block text-[10.5px] leading-relaxed text-muted">{node.detail}</span>}
            </span>
          </li>
        ))}
      </ol>

      <ul className="mt-3 space-y-1 border-t border-rule pt-3">
        {diagram.links.map((link, index) => {
          const from = nodeById.get(link.from);
          const to = nodeById.get(link.to);
          if (!from || !to) return null;
          return (
            <li key={link.from + '-' + link.to + '-' + index} className="text-[10.5px] leading-relaxed text-muted">
              <span className="text-ink">{from.label}</span>
              <span aria-hidden="true"> → </span>
              <span className="text-ink">{to.label}</span>
              {link.label && <span>：{link.label}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function ArticleDiagram({ diagram }: { diagram: unknown }) {
  if (!isRenderableDiagram(diagram)) return null;

  return (
    <FigureFrame diagram={diagram}>
      {diagram.type === 'comparison' && <Comparison diagram={diagram} />}
      {diagram.type === 'timeline' && <Timeline diagram={diagram} />}
      {diagram.type === 'relationship' && <Relationship diagram={diagram} />}
    </FigureFrame>
  );
}
