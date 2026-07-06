import { SECTION_META, SECTION_ORDER } from '@/lib/issues';

const ITEMS: { href: string; label: string }[] = [
  { href: '#summary', label: '今朝の要点' },
  { href: '#top', label: '一面' },
  ...SECTION_ORDER.map((id) => ({ href: `#sec-${id}`, label: SECTION_META[id].title })),
  { href: '#frontier', label: '深掘り' },
  { href: '#insights', label: '今日の示唆' },
];

export default function SectionNav() {
  return (
    <nav className="sticky top-0 z-40 -mx-4 border-b border-rule bg-paper/90 px-4 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="scrollbar-none flex gap-5 overflow-x-auto">
        {ITEMS.map((it) => (
          <a
            key={it.href}
            href={it.href}
            className="whitespace-nowrap py-2.5 text-xs text-muted transition-colors hover:text-accent"
          >
            {it.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
