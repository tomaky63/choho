import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import IssueView from '@/components/IssueView';
import { formatDateJa, getAllIssues, getIssueByDate } from '@/lib/issues';

interface Props {
  params: Promise<{ date: string }>;
}

export function generateStaticParams() {
  return getAllIssues().map((i) => ({ date: i.date }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const issue = getIssueByDate(date);
  if (!issue) return {};
  return {
    title: `${formatDateJa(issue.date)} 第${issue.edition}号`,
    description: issue.top_story.headline,
  };
}

export default async function IssuePage({ params }: Props) {
  const { date } = await params;
  const issue = getIssueByDate(date);
  if (!issue) notFound();
  return <IssueView issue={issue} />;
}
