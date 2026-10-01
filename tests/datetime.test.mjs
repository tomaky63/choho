import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';

// Use the project's existing compiler so tests also run on the Node 20 CI runtime.
const source = fs.readFileSync(new URL('../src/lib/datetime.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { formatGeneratedAtJst } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('keeps Japanese time and exposes the full generation date', () => {
  assert.equal(formatGeneratedAtJst('2026-10-01T07:59:07+09:00'), '2026/10/01 07:59 JST');
});
test('converts UTC and handles the Japan date rollover', () => {
  assert.equal(formatGeneratedAtJst('2026-09-30T22:59:07Z'), '2026/10/01 07:59 JST');
  assert.equal(formatGeneratedAtJst('2026-09-30T15:00:00Z'), '2026/10/01 00:00 JST');
});
test('rejects missing, invalid and timezone-ambiguous values', () => {
  for (const value of [undefined, '', 'invalid', '2026-10-01T07:59:07', 'badT07:59:07Z']) {
    assert.equal(formatGeneratedAtJst(value), null);
  }
});
