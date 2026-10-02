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
const source = fs.readFileSync(path.join(root, 'src/components/ArticleDiagram.tsx'), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
});
const compiled = { exports: {} };
new Function('require', 'module', 'exports', outputText)(createRequire(import.meta.url), compiled, compiled.exports);
const ArticleDiagram = compiled.exports.default;
const render = (diagram) => renderToStaticMarkup(React.createElement(ArticleDiagram, { diagram }));

test('comparison diagram keeps actual and forecast visible without generated images', () => {
  const html = render({
    type: 'comparison',
    title: '大企業の業況判断DI',
    unit: '％ポイント',
    note: '9月は実績、12月は予測。<確認>',
    items: [
      { label: '製造業・9月', value: 24, display_value: '24', status: 'actual' },
      { label: '製造業・12月', value: 21, display_value: '21', status: 'forecast' },
    ],
  });
  assert.match(html, /<figure/);
  assert.match(html, /製造業・9月/);
  assert.match(html, /実績/);
  assert.match(html, /予測/);
  assert.match(html, /9月は実績、12月は予測。&lt;確認&gt;/);
  assert.doesNotMatch(html, /<img/);
});

test('timeline and relationship diagrams expose their meaning as text', () => {
  const timeline = render({
    type: 'timeline',
    title: '主要日程',
    items: [
      { date: '10月1日', label: '公表', status: 'actual' },
      { date: '12月1日', label: '施行予定', detail: '政令が前提', status: 'forecast' },
    ],
  });
  assert.match(timeline, /10月1日/);
  assert.match(timeline, /政令が前提/);

  const relationship = render({
    type: 'relationship',
    title: '資金の関係',
    nodes: [
      { id: 'lender', label: '資金提供者' },
      { id: 'customer', label: 'AI企業' },
      { id: 'supplier', label: '供給者' },
    ],
    links: [
      { from: 'lender', to: 'customer', label: '融資' },
      { from: 'customer', to: 'supplier', label: '利用料' },
    ],
  });
  assert.match(relationship, /<svg/);
  assert.match(relationship, /資金提供者/);
  assert.match(relationship, /融資/);
  assert.doesNotMatch(relationship, /<img/);
});

test('invalid optional diagram renders nothing', () => {
  assert.equal(render({ type: 'comparison', title: '不足', items: [{ label: '1件', value: 1 }] }), '');
  assert.equal(render({ type: 'relationship', title: '壊れた参照', nodes: [
    { id: 'a', label: 'A' }, { id: 'b', label: 'B' },
  ], links: [{ from: 'a', to: 'missing' }] }), '');
});

test('invalid optional diagram warns but does not fail issue validation', () => {
  const issue = JSON.parse(fs.readFileSync(path.join(root, 'content/issues/2026-10-01.json'), 'utf8'));
  const prior = fs.readFileSync(path.join(root, 'content/issues/2026-09-30.json'), 'utf8');
  issue.top_story.diagram = { type: 'comparison', title: '不足', items: [{ label: '1件', value: 1 }] };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'choho-diagram-'));
  try {
    fs.mkdirSync(path.join(dir, 'content/issues'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'content/issues/2026-09-30.json'), prior);
    fs.writeFileSync(path.join(dir, 'content/issues/2026-10-01.json'), JSON.stringify(issue));
    const result = spawnSync(process.execPath, [path.join(root, 'scripts/validate-issue.mjs')], {
      cwd: dir,
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /diagram/);
    assert.match(result.stdout, /本文の検証は継続する/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
