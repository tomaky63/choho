import type { Issue } from '@/lib/issues';
import {
  SECTION_META,
  frontierReadingMinutes,
  getAdjacentIssues,
  mainReadingMinutes,
} from '@/lib/issues';
import Masthead from '@/components/Masthead';
import MarketTicker from '@/components/MarketTicker';
import SectionNav from '@/components/SectionNav';
import SummaryBox from '@/components/SummaryBox';
import TopStory from '@/components/TopStory';
import ArticleCard from '@/components/ArticleCard';
import SectionHeading from '@/components/SectionHeading';
import FrontierFeature from '@/components/FrontierFeature';
import InsightsPanel from '@/components/InsightsPanel';
import GlossaryList from '@/components/GlossaryList';
import IssueNav from '@/components/IssueNav';

export default function IssueView({ issue }: { issue: Issue }) {
  const { prev, next } = getAdjacentIssues(issue.date);
  const readingLabel = `本編 約${mainReadingMinutes(issue)}分 · 深掘り 約${frontierReadingMinutes(issue)}分`;

  return (
    <>
      <Masthead
        date={issue.date}
        edition={issue.edition}
        generatedAt={issue.generated_at}
        mastheadNote={issue.masthead_note}
        readingLabel={readingLabel}
      />
      <MarketTicker snapshot={issue.market_snapshot} />
      <SectionNav />

      <main>
        <SummaryBox items={issue.executive_summary} />
        <TopStory article={issue.top_story} />

        {issue.sections.map((sec) => (
          <section key={sec.id}>
            <SectionHeading
              id={`sec-${sec.id}`}
              title={SECTION_META[sec.id].title}
              en={SECTION_META[sec.id].en}
            />
            <div className="grid gap-4 lg:grid-cols-2">
              {sec.articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        ))}

        <FrontierFeature issue={issue} />
        <InsightsPanel insights={issue.insights} />
        <GlossaryList items={issue.glossary} />
        <IssueNav prev={prev} next={next} />
      </main>
    </>
  );
}
