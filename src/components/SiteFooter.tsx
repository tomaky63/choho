import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t-2 border-ink-strong py-6 text-[11px] leading-relaxed text-muted">
      <p className="tracking-palt font-serif text-[13px] font-bold text-ink-strong">
        朝報 <span className="ml-1 text-[10px] font-normal tracking-[0.3em]">CHOHO</span>
      </p>
      <p className="mt-2">
        経済と最先端技術の朝刊。毎朝、Codex
        の自動化が信頼できる報道を調査・要約して更新しています。内容は生成時点の情報に基づく要約と分析であり、正確性は各記事の出典リンクで確認してください。投資その他の判断は自己責任で。
      </p>
      <p className="mt-2">
        <Link href="/archive/" className="text-link underline-offset-[3px] hover:underline">
          アーカイブ
        </Link>
      </p>
    </footer>
  );
}
