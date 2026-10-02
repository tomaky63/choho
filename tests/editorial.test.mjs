import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = path.resolve(import.meta.dirname, '..');
const issue = JSON.parse(fs.readFileSync(path.join(root, 'content/issues/2026-10-01.json'), 'utf8'));
const prior = fs.readFileSync(path.join(root, 'content/issues/2026-09-30.json'), 'utf8');
const sample = {
  previous: { date: '2026-09-30', article_id: 'samsung-hbm-capacity' },
  assessment: 'mixed',
  reassessment: 'テスト用：前回の見立てと新材料を比較する。',
  next_check: 'テスト用：数量と稼働時期を確認する。',
  reconsider_if: 'テスト用：供給余力が回復すれば見直す。',
};
const clone = () => structuredClone(issue);
const article = (data) => data.sections.flatMap((section) => section.articles).find((entry) => entry.id === 'micron-record-results')
  ?? (data.top_story.id === 'micron-record-results' ? data.top_story : null);
function validate(data) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'choho-editorial-'));
  try {
    fs.mkdirSync(path.join(dir, 'content/issues'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'content/issues/2026-09-30.json'), prior);
    fs.writeFileSync(path.join(dir, 'content/issues/2026-10-01.json'), JSON.stringify(data));
    return spawnSync(process.execPath, [path.join(root, 'scripts/validate-issue.mjs')], { cwd: dir, encoding: 'utf8' });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
const cache = new Map();
function load(relative) {
  if (cache.has(relative)) return cache.get(relative);
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  const compiled = { exports: {} };
  const realRequire = createRequire(import.meta.url);
  const require = (id) => id.startsWith('@/')
    ? load(`src/${id.slice(2)}${id.startsWith('@/components/') ? '.tsx' : '.ts'}`)
    : realRequire(id);
  new Function('require', 'module', 'exports', outputText)(require, compiled, compiled.exports);
  cache.set(relative, compiled.exports);
  return compiled.exports;
}

test('legacy issue and optional editorial extensions validate', () => {
  assert.equal(validate(clone()).status, 0);
  const data = clone();
  data.focus_refs = data.executive_summary.slice(0, 2).map((entry) => entry.ref);
  article(data).follow_up = sample;
  const result = validate(data);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('generation timestamps reject ambiguous, non-ISO and normalized dates', () => {
  for (const value of ['2026-10-01T07:59:07', '2026-10-01', 'October 1, 2026 07:59:07 GMT',
    '2026-02-30T07:59:07+09:00', '2026-02-29T07:59:07Z', '2026-04-31T07:59:07Z',
    '2026-10-01T24:00:00Z', '2026-10-01T07:60:00Z', '2026-10-01T07:59:60Z',
    ' 2026-10-01T07:59:07Z']) {
    const data = clone(); data.generated_at = value;
    const result = validate(data);
    assert.equal(result.status, 1, value);
    assert.match(result.stdout, /generated_at/);
  }
});

test('explicit UTC, signed offsets, minutes and fractions remain valid and visible', () => {
  const { formatGeneratedAtJst } = load('src/lib/datetime.ts');
  for (const value of ['2026-09-30T22:59:07Z', '2026-09-30T18:59:07-04:00',
    '2026-10-01T07:59+09:00', '2026-10-01T07:59:07.123+09:00']) {
    const data = clone(); data.generated_at = value;
    const result = validate(data);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(formatGeneratedAtJst(value), '2026/10/01 07:59 JST');
  }
});

test('pending remains distinct from an unchanged assessment', () => {
  const data = clone(); article(data).follow_up = { ...sample, assessment: 'pending' };
  assert.equal(validate(data).status, 0);
  const Panel = load('src/components/FollowUpPanel.tsx').default;
  const html = renderToStaticMarkup(React.createElement(Panel, { followUp: article(data).follow_up }));
  assert.match(html, /判断保留/);
  assert.doesNotMatch(html, /見立ては据え置き/);
});

test('focus refs reject wrong counts, duplicates, missing articles and missing summaries', () => {
  const missingSummary = [issue.top_story, ...issue.sections.flatMap((section) => section.articles)]
    .find((entry) => !issue.executive_summary.some((item) => item.ref === entry.id)).id;
  const first = issue.executive_summary[0].ref;
  for (const refs of [null, [], [first], [first, first], [first, 'missing'], [first, missingSummary]]) {
    const data = clone(); data.focus_refs = refs;
    const result = validate(data);
    assert.equal(result.status, 1, JSON.stringify(refs));
    assert.match(result.stdout, /focus_refs/);
  }
});

test('follow up rejects invalid, future and nonexistent references', () => {
  for (const previous of [null, { date: '../bad', article_id: 'id' },
    { date: '2026-10-01', article_id: 'id' }, { date: '2026-10-02', article_id: 'id' },
    { date: '2026-09-31', article_id: 'id' }, { date: '2026-09-29', article_id: 'id' },
    { date: '2026-09-30', article_id: 'missing' }, { date: '2026-09-30', article_id: '../bad' }]) {
    const data = clone(); article(data).follow_up = { ...sample, previous };
    const result = validate(data);
    assert.equal(result.status, 1, JSON.stringify(previous));
    assert.match(result.stdout, /follow_up/);
  }
});

test('follow up rejects invalid assessment, blank fields, minor stories and more than two panels', () => {
  const cases = [null, { ...sample, assessment: 'certain' }, { ...sample, reassessment: '' },
    { ...sample, next_check: '' }, { ...sample, reconsider_if: '' }];
  for (const value of cases) {
    const data = clone(); article(data).follow_up = value;
    assert.equal(validate(data).status, 1);
  }
  const minor = clone(); article(minor).importance = 1; article(minor).follow_up = sample;
  assert.equal(validate(minor).status, 1);
  const excess = clone();
  [excess.top_story, ...excess.sections.flatMap((section) => section.articles)].slice(0, 3)
    .forEach((entry) => { entry.importance = 2; entry.follow_up = sample; });
  assert.match(validate(excess).stdout, /最大2本/);
});

test('priority summary reorders existing items without duplicating or dropping text', () => {
  const SummaryBox = load('src/components/SummaryBox.tsx').default;
  const items = [{ text: 'ALPHA', ref: 'a' }, { text: 'BETA', ref: 'b' }, { text: 'GAMMA', ref: 'c' }];
  const html = renderToStaticMarkup(React.createElement(SummaryBox, { items, focusRefs: ['c', 'a'] }));
  assert.ok(html.indexOf('GAMMA') < html.indexOf('ALPHA') && html.indexOf('ALPHA') < html.indexOf('BETA'));
  for (const text of ['ALPHA', 'BETA', 'GAMMA']) assert.equal(html.split(text).length - 1, 1);
  assert.match(html, /まずこの2本/);
  const legacy = renderToStaticMarkup(React.createElement(SummaryBox, { items }));
  assert.doesNotMatch(legacy, /まずこの/);
  assert.ok(legacy.indexOf('ALPHA') < legacy.indexOf('BETA'));
});

test('both main and section stories display safe follow-up links and hide absent panels', () => {
  for (const component of ['ArticleCard', 'TopStory']) {
    const View = load(`src/components/${component}.tsx`).default;
    const data = { ...article(clone()), follow_up: { ...sample, reassessment: '<script>sample</script>' } };
    const html = renderToStaticMarkup(React.createElement(View, { article: data }));
    assert.match(html, /href="\/issues\/2026-09-30\/?#samsung-hbm-capacity"/);
    assert.match(html, /材料は混在/);
    assert.match(html, /この見立てを変える条件/);
    assert.match(html, /&lt;script&gt;sample&lt;\/script&gt;/);
    delete data.follow_up;
    assert.doesNotMatch(renderToStaticMarkup(React.createElement(View, { article: data })), /前回からの見立て/);
  }
});

test('reading time includes follow-up text', () => {
  const { mainReadingMinutes } = load('src/lib/issues.ts');
  const data = clone(); const before = mainReadingMinutes(data);
  article(data).follow_up = { ...sample, reassessment: '読'.repeat(1100), next_check: '', reconsider_if: '' };
  assert.equal(mainReadingMinutes(data), before + 2);
});
