import Link from 'next/link';
import Masthead from '@/components/Masthead';

export default function NotFound() {
  return (
    <>
      <Masthead />
      <main className="py-20 text-center">
        <p className="tracking-palt font-serif text-lg font-bold text-ink-strong">
          お探しの号は見つかりませんでした
        </p>
        <p className="mt-4 text-sm text-muted">
          <Link href="/archive/" className="text-link underline-offset-[3px] hover:underline">
            アーカイブから探す
          </Link>
          {' / '}
          <Link href="/" className="text-link underline-offset-[3px] hover:underline">
            最新号へ
          </Link>
        </p>
      </main>
    </>
  );
}
