import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const source = fs.readFileSync(new URL('../src/components/MarketTicker.tsx', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
});
const compiled = { exports: {} };
new Function('require', 'module', 'exports', outputText)(createRequire(import.meta.url), compiled, compiled.exports);
const MarketTicker = compiled.exports.default;
const render = (note) => renderToStaticMarkup(React.createElement(MarketTicker, {
  snapshot: { as_of: '確認時点', items: [{ label: 'USD/JPY', value: '150円', direction: 'down', note }] },
}));

test('notes have a native disclosure and are safely escaped', () => {
  const html = render('前日NY終値比 <確認>');
  assert.match(html, /<details/);
  assert.match(html, /<summary[^>]*>指標の注記・比較時点 \(1件\)<\/summary>/);
  assert.match(html, /<dt[^>]*>USD\/JPY<\/dt>/);
  assert.match(html, /前日NY終値比 &lt;確認&gt;/);
  assert.doesNotMatch(html, /<details[^>]* open/);
});
test('missing and blank notes leave no empty disclosure', () => {
  for (const note of [undefined, '', '  ']) assert.doesNotMatch(render(note), /<details/);
});
