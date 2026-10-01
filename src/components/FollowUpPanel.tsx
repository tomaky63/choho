import Link from 'next/link';
import type { FollowUp } from '@/lib/issues';

const ASSESSMENT_LABEL = {
  strengthened: '見立てを補強',
  weakened: '見立てを弱める',
  mixed: '材料は混在',
  unchanged: '見立ては据え置き',
  pending: '判断保留',
} as const;

export default function FollowUpPanel({ followUp }: { followUp: FollowUp }) {
  return (
    <aside aria-label="前回からの見立て" className="mt-3 rounded-sm border border-rule bg-paper p-4 text-[13px] leading-relaxed">
      <p className="mb-2 font-bold text-ink-strong">
        前回からの見立て <span className="ml-1 text-accent">{ASSESSMENT_LABEL[followUp.assessment]}</span>
      </p>
      <Link
        href={`/issues/${followUp.previous.date}/#${followUp.previous.article_id}`}
        className="text-[11px] text-link underline underline-offset-2"
      >
        {followUp.previous.date} の関連記事を読む
      </Link>
      <p className="mt-2">{followUp.reassessment}</p>
      <dl className="mt-3 space-y-2 border-t border-rule pt-3">
        <div>
          <dt className="font-bold text-muted">次に確かめること</dt>
          <dd>{followUp.next_check}</dd>
        </div>
        <div>
          <dt className="font-bold text-muted">この見立てを変える条件</dt>
          <dd>{followUp.reconsider_if}</dd>
        </div>
      </dl>
    </aside>
  );
}
