import type { Metadata } from 'next';
import Masthead from '@/components/Masthead';
import IssueView from '@/components/IssueView';
import { formatDateJa, getLatestIssue } from '@/lib/issues';

export function generateMetadata(): Metadata {
  const issue = getLatestIssue();
  if (!issue) return {};
  return {
    title: `朝報 — ${formatDateJa(issue.date)} 第${issue.edition}号`,
    description: issue.top_story.headline,
  };
}

export default function Home() {
  const issue = getLatestIssue();

  if (!issue) {
    return (
      <>
        <Masthead />
        <main className="py-20 text-center text-sm text-muted">
          <p>まだ号がありません。明朝の自動更新をお待ちください。</p>
        </main>
      </>
    );
  }

  return <IssueView issue={issue} />;
}
