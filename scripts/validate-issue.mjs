#!/usr/bin/env node
/**
 * 号データ(content/issues/YYYY-MM-DD.json)の検証スクリプト。
 *
 * 使い方:
 *   node scripts/validate-issue.mjs content/issues/2026-07-06.json
 *   node scripts/validate-issue.mjs            # 最新の号を自動選択
 *
 * 終了コード: 0 = 合格(警告があっても合格) / 1 = エラーあり
 * 構造の欠陥は「エラー」、分量・件数の目安からの逸脱は「警告」として扱う。
 */
import fs from 'node:fs';
import path from 'node:path';

const ISSUES_DIR = path.join(process.cwd(), 'content', 'issues');
const SECTION_IDS = [
  'macro_markets',
  'tech_ai',
  'business',
  'world_geopolitics',
  'policy_regulation',
];

const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

// ---- 対象ファイルの決定 ----
let file = process.argv[2];
if (!file) {
  const files = fs
    .readdirSync(ISSUES_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();
  if (files.length === 0) {
    console.error('content/issues/ に号ファイルがありません');
    process.exit(1);
  }
  file = path.join(ISSUES_DIR, files[files.length - 1]);
}

const fileName = path.basename(file);
if (!/^\d{4}-\d{2}-\d{2}\.json$/.test(fileName)) {
  console.error(`ファイル名が YYYY-MM-DD.json 形式ではありません: ${fileName}`);
  process.exit(1);
}
const fileDate = fileName.replace('.json', '');

let issue;
try {
  issue = JSON.parse(fs.readFileSync(file, 'utf-8'));
} catch (e) {
  console.error(`JSON パース失敗: ${e.message}`);
  process.exit(1);
}

// ---- 汎用チェッカー ----
const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isUrl = (v) => typeof v === 'string' && /^https?:\/\/\S+$/.test(v);

function checkSources(sources, ctx) {
  if (!Array.isArray(sources) || sources.length === 0) {
    err(`${ctx}: sources が空。各記事に1件以上の出典が必要`);
    return;
  }
  if (sources.length > 4) warn(`${ctx}: sources が ${sources.length} 件。1〜3件が目安`);
  sources.forEach((s, i) => {
    if (!isStr(s?.title)) err(`${ctx}: sources[${i}].title がない`);
    if (!isStr(s?.publisher)) err(`${ctx}: sources[${i}].publisher がない`);
    if (!isUrl(s?.url)) err(`${ctx}: sources[${i}].url が http(s) URL ではない: ${s?.url}`);
  });
}

const isDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
  && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
// Keep accepted timestamps consistent with formatGeneratedAtJst (including calendar validity).
const isTimestamp = (value) => typeof value === 'string'
  && /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)
  && isDate(value.slice(0, 10)) && !Number.isNaN(Date.parse(value));
let followUpCount = 0;
function checkFollowUp(value, article, ctx) {
  if (value === undefined) return;
  followUpCount += 1;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    err(`${ctx}: follow_up はオブジェクト`);
    return;
  }
  if (![2, 3].includes(article.importance)) err(`${ctx}: follow_up は importance 2|3 の主要記事だけに付ける`);
  if (!['strengthened', 'weakened', 'mixed', 'unchanged', 'pending'].includes(value.assessment))
    err(`${ctx}: follow_up.assessment は strengthened|weakened|mixed|unchanged|pending`);
  for (const key of ['reassessment', 'next_check', 'reconsider_if']) {
    if (!isStr(value[key])) err(`${ctx}: follow_up.${key} がない`);
  }
  const length = ['reassessment', 'next_check', 'reconsider_if']
    .reduce((total, key) => total + (typeof value[key] === 'string' ? value[key].length : 0), 0);
  if (length > 450) warn(`${ctx}: follow_up が ${length} 字。本文の繰り返しを避け、合計450字以内を目安にする`);
  const previous = value.previous;
  if (!isDate(previous?.date) || previous.date >= fileDate) {
    err(`${ctx}: follow_up.previous.date は本号より前の実在日付`);
    return;
  }
  if (!isStr(previous?.article_id) || !/^[a-z0-9-]+$/.test(previous.article_id)) {
    err(`${ctx}: follow_up.previous.article_id は過去記事の kebab-case id`);
    return;
  }
  try {
    const prior = JSON.parse(fs.readFileSync(path.join(ISSUES_DIR, `${previous.date}.json`), 'utf-8'));
    const articles = [prior.top_story, ...(prior.sections ?? []).flatMap((section) => section.articles ?? [])];
    if (!articles.some((entry) => entry?.id === previous.article_id))
      err(`${ctx}: follow_up の参照先記事 ${previous.date}#${previous.article_id} がない`);
  } catch {
    err(`${ctx}: follow_up の参照先号 ${previous.date} を読み込めない`);
  }
}

let diagramCount = 0;
function checkDiagram(value, ctx) {
  if (value === undefined) return;
  diagramCount += 1;
  const diagramWarn = (message) => warn(`${ctx}: diagram ${message}。図は省略可能で、本文の検証は継続する`);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    diagramWarn('はオブジェクトにする');
    return;
  }
  if (!isStr(value.title)) diagramWarn('title がない');
  if (value.note !== undefined && !isStr(value.note)) diagramWarn('note は空でない文字列にする');

  if (value.type === 'comparison') {
    if (value.unit !== undefined && !isStr(value.unit))
      diagramWarn('comparison.unit は空でない文字列にする');
    if (!Array.isArray(value.items) || value.items.length < 2 || value.items.length > 8) {
      diagramWarn('comparison.items は2〜8件にする');
      return;
    }
    if (!isStr(value.note)) diagramWarn('comparison.note に時点・単位・実績／予測の区別を書く');
    value.items.forEach((item, index) => {
      if (!isStr(item?.label)) diagramWarn(`items[${index}].label がない`);
      if (typeof item?.value !== 'number' || !Number.isFinite(item.value))
        diagramWarn(`items[${index}].value は有限の数値にする`);
      if (item?.display_value !== undefined && !isStr(item.display_value))
        diagramWarn(`items[${index}].display_value は空でない文字列にする`);
      if (item?.status !== undefined && !['actual', 'forecast', 'context'].includes(item.status))
        diagramWarn(`items[${index}].status は actual|forecast|context`);
    });
    return;
  }

  if (value.type === 'timeline') {
    if (!Array.isArray(value.items) || value.items.length < 2 || value.items.length > 8) {
      diagramWarn('timeline.items は2〜8件にする');
      return;
    }
    value.items.forEach((item, index) => {
      if (!isStr(item?.date)) diagramWarn(`items[${index}].date がない`);
      if (!isStr(item?.label)) diagramWarn(`items[${index}].label がない`);
      if (item?.detail !== undefined && !isStr(item.detail))
        diagramWarn(`items[${index}].detail は空でない文字列にする`);
      if (item?.status !== undefined && !['actual', 'forecast', 'context'].includes(item.status))
        diagramWarn(`items[${index}].status は actual|forecast|context`);
    });
    return;
  }

  if (value.type === 'relationship') {
    if (!Array.isArray(value.nodes) || value.nodes.length < 2 || value.nodes.length > 6) {
      diagramWarn('relationship.nodes は2〜6件にする');
      return;
    }
    if (!Array.isArray(value.links) || value.links.length < 1 || value.links.length > 8) {
      diagramWarn('relationship.links は1〜8件にする');
      return;
    }
    const ids = new Set();
    value.nodes.forEach((node, index) => {
      if (!isStr(node?.id) || !/^[a-z0-9-]+$/.test(node.id))
        diagramWarn(`nodes[${index}].id は kebab-case 英数字にする`);
      else if (ids.has(node.id)) diagramWarn(`nodes[${index}].id が重複: ${node.id}`);
      else ids.add(node.id);
      if (!isStr(node?.label)) diagramWarn(`nodes[${index}].label がない`);
      if (node?.detail !== undefined && !isStr(node.detail))
        diagramWarn(`nodes[${index}].detail は空でない文字列にする`);
    });
    value.links.forEach((link, index) => {
      if (!isStr(link?.from) || !ids.has(link.from)) diagramWarn(`links[${index}].from の参照先がない`);
      if (!isStr(link?.to) || !ids.has(link.to)) diagramWarn(`links[${index}].to の参照先がない`);
      if (link?.from === link?.to) diagramWarn(`links[${index}] は同じノードを結べない`);
      if (link?.label !== undefined && !isStr(link.label))
        diagramWarn(`links[${index}].label は空でない文字列にする`);
    });
    return;
  }

  diagramWarn('type は comparison|timeline|relationship');
}
const articleIds = new Set();
function checkArticle(a, ctx) {
  if (!isStr(a?.id)) {
    err(`${ctx}: id がない`);
  } else {
    if (!/^[a-z0-9-]+$/.test(a.id)) err(`${ctx}: id は kebab-case 英数字にする: ${a.id}`);
    if (articleIds.has(a.id)) err(`${ctx}: id が重複: ${a.id}`);
    articleIds.add(a.id);
  }
  if (!isStr(a?.headline)) err(`${ctx}: headline がない`);
  else if (a.headline.length > 40) warn(`${ctx}: headline が ${a.headline.length} 字。40字以内が目安`);
  if (![1, 2, 3].includes(a?.importance)) err(`${ctx}: importance は 1|2|3`);
  if (!Array.isArray(a?.facts) || a.facts.length < 2) {
    err(`${ctx}: facts は2件以上の配列(事実の箇条書き)`);
  } else {
    if (a.facts.length > 6) warn(`${ctx}: facts が ${a.facts.length} 件。2〜5件が目安`);
    a.facts.forEach((f, i) => {
      if (!isStr(f)) err(`${ctx}: facts[${i}] が空`);
    });
  }
  if (!isStr(a?.why_it_matters)) err(`${ctx}: why_it_matters がない`);
  else if (a.why_it_matters.length < 40)
    warn(`${ctx}: why_it_matters が ${a.why_it_matters.length} 字。40字以上で構造的な意味を書く`);
  checkSources(a?.sources, ctx);
  checkFollowUp(a?.follow_up, a, ctx);
  checkDiagram(a?.diagram, ctx);
}

// ---- トップレベル ----
if (issue.date !== fileDate) err(`date (${issue.date}) がファイル名 (${fileDate}) と一致しない`);
if (!Number.isInteger(issue.edition) || issue.edition < 1) err('edition は 1 以上の整数');
if (!isTimestamp(issue.generated_at))
  err('generated_at は実在する日付・時刻の ISO 8601 日時(タイムゾーン Z または ±HH:MM が必須)');

// edition の連番チェック(過去号があれば)
try {
  const others = fs
    .readdirSync(ISSUES_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f) && f !== fileName && f < fileName);
  if (others.length > 0) {
    const prevFile = others.sort()[others.length - 1];
    const prev = JSON.parse(fs.readFileSync(path.join(ISSUES_DIR, prevFile), 'utf-8'));
    if (Number.isInteger(prev.edition) && issue.edition !== prev.edition + 1) {
      err(`edition (${issue.edition}) が前号 ${prevFile} の edition+1 (${prev.edition + 1}) ではない`);
    }
  }
} catch {
  /* 過去号の読み込み失敗は連番チェックをスキップ */
}

// ---- market_snapshot ----
if (!issue.market_snapshot || !isStr(issue.market_snapshot.as_of)) {
  err('market_snapshot.as_of がない(いつ時点の値かを明記)');
}
const mkt = issue.market_snapshot?.items;
if (!Array.isArray(mkt) || mkt.length < 4) {
  err('market_snapshot.items は4件以上(日経平均・USD/JPY・長期金利など主要指標)');
} else {
  if (mkt.length > 10) warn(`market_snapshot.items が ${mkt.length} 件。4〜8件が目安`);
  mkt.forEach((m, i) => {
    if (!isStr(m?.label)) err(`market_snapshot.items[${i}].label がない`);
    if (!isStr(m?.value)) err(`market_snapshot.items[${i}].value がない`);
    if (!['up', 'down', 'flat'].includes(m?.direction))
      err(`market_snapshot.items[${i}].direction は up|down|flat`);
  });
}

// ---- executive_summary ----
const summary = issue.executive_summary;
if (!Array.isArray(summary) || summary.length < 5 || summary.length > 8) {
  err(`executive_summary は5〜8項目(現在 ${summary?.length ?? 0})`);
} else {
  summary.forEach((s, i) => {
    if (!isStr(s?.text)) err(`executive_summary[${i}].text がない`);
    else if (s.text.length > 90) warn(`executive_summary[${i}] が ${s.text.length} 字。90字以内が目安`);
  });
}

// ---- top_story / sections ----
if (!issue.top_story) err('top_story がない');
else checkArticle(issue.top_story, 'top_story');

if (!Array.isArray(issue.sections)) {
  err('sections が配列ではない');
} else {
  const ids = issue.sections.map((s) => s?.id);
  if (JSON.stringify(ids) !== JSON.stringify(SECTION_IDS)) {
    err(`sections の id は次の5つをこの順で: ${SECTION_IDS.join(', ')} (現在: ${ids.join(', ')})`);
  }
  issue.sections.forEach((sec) => {
    const ctx = `sections[${sec?.id}]`;
    if (!Array.isArray(sec?.articles) || sec.articles.length === 0) {
      err(`${ctx}: articles が空。各セクション2〜3本`);
      return;
    }
    if (sec.articles.length < 2) warn(`${ctx}: 記事が1本のみ。2〜3本が目安`);
    if (sec.articles.length > 4) warn(`${ctx}: 記事が ${sec.articles.length} 本。2〜3本が目安(多すぎると読了10分を超える)`);
    sec.articles.forEach((a, i) => checkArticle(a, `${ctx}.articles[${i}]`));
  });
}

if (followUpCount > 2) err(`follow_up は1号あたり最大2本(現在 ${followUpCount})`);

// focus_refs は既存の要点を優先表示するだけ。別の要約は増やさない。
if (issue.focus_refs !== undefined) {
  if (!Array.isArray(issue.focus_refs) || issue.focus_refs.length < 2 || issue.focus_refs.length > 3) {
    err('focus_refs は記事idを2〜3件指定する配列');
  } else {
    if (new Set(issue.focus_refs).size !== issue.focus_refs.length) err('focus_refs に重複がある');
    issue.focus_refs.forEach((ref) => {
      if (!isStr(ref) || !articleIds.has(ref)) err(`focus_refs の記事 ${ref} がない`);
      const matching = Array.isArray(summary) ? summary.filter((entry) => entry?.ref === ref) : [];
      if (matching.length !== 1) err(`focus_refs の記事 ${ref} は executive_summary.ref に1回だけ必要`);
    });
  }
}

// summary の ref が実在する記事を指すか
if (Array.isArray(summary)) {
  summary.forEach((s, i) => {
    if (s?.ref && !articleIds.has(s.ref))
      err(`executive_summary[${i}].ref (${s.ref}) に該当する記事 id がない`);
  });
}

// ---- frontier(深掘り) ----
const fr = issue.frontier;
if (!fr) {
  err('frontier(深掘り)がない。毎号1本必須');
} else {
  if (!isStr(fr.title)) err('frontier.title がない');
  if (!isStr(fr.dek)) err('frontier.dek(リード文)がない');
  if (!isStr(fr.body_md)) {
    err('frontier.body_md がない');
  } else {
    const len = fr.body_md.length;
    if (len < 1200) err(`frontier.body_md が ${len} 字。1,500〜2,500字で書く(下限1,200字)`);
    else if (len < 1500) warn(`frontier.body_md が ${len} 字。1,500字以上が目安`);
    if (len > 3200) warn(`frontier.body_md が ${len} 字。2,500字前後に収める`);
    if (!/^##\s/m.test(fr.body_md)) warn('frontier.body_md に見出し(## )がない。3〜5節に分けると読みやすい');
  }
  checkSources(fr.sources, 'frontier');
  checkDiagram(fr.diagram, 'frontier');
}

// ---- insights ----
const ins = issue.insights;
if (!ins) {
  err('insights(今日の示唆)がない');
} else {
  if (!Array.isArray(ins.implications) || ins.implications.length < 2)
    err('insights.implications は2件以上');
  if (!Array.isArray(ins.watchlist) || ins.watchlist.length < 2) {
    err('insights.watchlist は2件以上');
  } else {
    ins.watchlist.forEach((w, i) => {
      if (!isStr(w?.item)) err(`insights.watchlist[${i}].item がない`);
      if (!isStr(w?.why)) err(`insights.watchlist[${i}].why がない`);
    });
  }
}

// ---- glossary ----
const gl = issue.glossary;
if (!Array.isArray(gl) || gl.length < 2) {
  err('glossary は2件以上(4件まで)');
} else {
  if (gl.length > 4) warn(`glossary が ${gl.length} 件。2〜4件が目安`);
  gl.forEach((g, i) => {
    if (!isStr(g?.term)) err(`glossary[${i}].term がない`);
    if (!isStr(g?.definition)) err(`glossary[${i}].definition がない`);
    else if (g.definition.length > 200) warn(`glossary[${i}] の定義が ${g.definition.length} 字。200字以内が目安`);
  });
}

if (diagramCount > 3) warn(`diagram が ${diagramCount} 件。図を固定枠にせず、本当に文章より明瞭な1〜2件へ絞る`);

// ---- 本編分量(概算) ----
function articleChars(a) {
  if (!a) return 0;
  return (
    (a.headline?.length ?? 0) +
    (a.dek?.length ?? 0) +
    (Array.isArray(a.facts) ? a.facts.join('').length : 0) +
    (a.why_it_matters?.length ?? 0) +
    (a.implications?.length ?? 0) +
    (typeof a.follow_up?.reassessment === 'string' ? a.follow_up.reassessment.length : 0) +
    (typeof a.follow_up?.next_check === 'string' ? a.follow_up.next_check.length : 0) +
    (typeof a.follow_up?.reconsider_if === 'string' ? a.follow_up.reconsider_if.length : 0)
  );
}
let mainChars = (summary ?? []).reduce((n, s) => n + (s?.text?.length ?? 0), 0);
mainChars += articleChars(issue.top_story);
for (const sec of issue.sections ?? []) {
  for (const a of sec.articles ?? []) mainChars += articleChars(a);
}
if (mainChars < 3500) warn(`本編合計が約 ${mainChars} 字。5,000〜6,000字(読了10分)が目安`);
if (mainChars > 8000) warn(`本編合計が約 ${mainChars} 字。5,000〜6,000字(読了10分)に収める`);

// ---- 結果 ----
console.log(`検証対象: ${file}`);
console.log(`本編: 約${mainChars}字 / 深掘り: 約${fr?.body_md?.length ?? 0}字`);
if (warnings.length) {
  console.log(`\n警告 (${warnings.length}件):`);
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
}
if (errors.length) {
  console.log(`\nエラー (${errors.length}件):`);
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  console.log('\n→ 不合格。エラーを修正して再実行してください。');
  process.exit(1);
}
console.log(`\n✓ 合格${warnings.length ? '(警告あり — 可能なら改善)' : ''}`);
