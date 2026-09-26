// Copyright 2026 Ix Infrastructure Inc.

// Regression tests: JS/TS calls resolved by name alone. Every vitest file's
// `describe(...)` (a global / an import from 'vitest') got a CALLS edge to an
// unrelated `SampleCommand.describe` method in test-fixtures.

import { describe, expect, it } from 'vitest';

import { parseFile, resolveEdges, type FileParseResult, type ResolvedEdge } from '../index.js';

function parse(filePath: string, source: string): FileParseResult {
  const result = parseFile(filePath, source);
  expect(result).not.toBeNull();
  return result!;
}

const callsTo = (edges: ResolvedEdge[], dstFilePath: string) =>
  edges.filter(e => e.predicate === 'CALLS' && e.dstFilePath === dstFilePath);

const SAMPLE_COMMAND = parse(
  'core-ingestion/test-fixtures/typescript/sample-command.ts',
  [
    'export function statusOf(r: string[]): string { return r.join(","); }',
    'export class CheckRunner {',
    '  describe(results: string[]): string { return statusOf(results); }',
    '  run(): number { return 1; }',
    '}',
    '',
  ].join('\n'),
);

const SAMPLE_COMMAND_SOURCE = [
  'export class CheckRunner {',
  '  describe(results: string[]): string { return results.join(","); }',
  '  run(): number { return 1; }',
  '}',
  '',
].join('\n');

const DOCTOR = parse(
  'ix-cli/src/cli/doctor.ts',
  'export function runDoctor(): number { return 1; }\n',
);

describe('call resolution respects lexical scope (JS/TS)', () => {
  it('does not link a vitest-imported describe() to an unrelated describe method', () => {
    const testFile = parse(
      'ix-cli/src/cli/__tests__/doctor.test.ts',
      [
        'import { describe, it, expect } from "vitest";',
        'import { runDoctor } from "../doctor.js";',
        'describe("doctor", () => {',
        '  it("runs", () => { expect(runDoctor()).toBe(1); });',
        '});',
        '',
      ].join('\n'),
    );

    const edges = resolveEdges([testFile, DOCTOR, SAMPLE_COMMAND]);

    expect(callsTo(edges, SAMPLE_COMMAND.filePath)).toEqual([]);
    // The legitimate imported call still resolves at the import tier.
    expect(callsTo(edges, DOCTOR.filePath)).toEqual([
      expect.objectContaining({ dstName: 'runDoctor', dstQualifiedKey: 'runDoctor', confidence: 0.9 }),
    ]);
  });

  it('does not link a jest-style global describe() (no import) to anything in the repo', () => {
    const jestFile = parse(
      'web/src/__tests__/widget.test.ts',
      'describe("widget", () => { test("renders", () => { expect(1).toBe(1); }); });\n',
    );
    // A module-scope function of the same name, in a file the test never imports.
    const helpers = parse(
      'web/src/test-helpers.ts',
      'export function describe(name: string): string { return name; }\n',
    );

    // Each alone would have been an unambiguous global-tier match.
    expect(resolveEdges([jestFile, helpers]).filter(e => e.predicate === 'CALLS')).toEqual([]);
    expect(resolveEdges([jestFile, SAMPLE_COMMAND]).filter(e => e.predicate === 'CALLS')).toEqual([]);
  });

  it('never resolves a bare call to a class member, even in a file the caller imports', () => {
    const caller = parse(
      'src/app.ts',
      [
        'import { CheckRunner } from "./sample.js";',
        'export function main(r: CheckRunner): string {',
        '  run();',
        '  return describe(["x"]);',
        '}',
        '',
      ].join('\n'),
    );
    const sample = parse('src/sample.ts', SAMPLE_COMMAND_SOURCE);

    const edges = resolveEdges([caller, sample]);
    expect(callsTo(edges, 'src/sample.ts')).toEqual([]);
  });

  it('still resolves member calls on an imported class (import tier)', () => {
    const caller = parse(
      'src/app.ts',
      [
        'import { CheckRunner } from "./sample.js";',
        'export function main(r: CheckRunner): string { return r.describe(["x"]); }',
        '',
      ].join('\n'),
    );
    const sample = parse('src/sample.ts', SAMPLE_COMMAND_SOURCE);

    expect(callsTo(resolveEdges([caller, sample]), 'src/sample.ts')).toEqual([
      expect.objectContaining({ dstName: 'describe', dstQualifiedKey: 'CheckRunner.describe', confidence: 0.9 }),
    ]);
  });

  it('resolves a bare call to the module-scope definition when a same-named member also exists', () => {
    const caller = parse(
      'src/app.ts',
      'import { run } from "./tasks.js";\nexport function main() { return run(); }\n',
    );
    const tasks = parse(
      'src/tasks.ts',
      'export class Job { run() { return 0; } }\nexport function run() { return new Job().run(); }\n',
    );

    // Before: bestQKey saw ['Job.run', 'run'], called it ambiguous, dropped the edge.
    expect(callsTo(resolveEdges([caller, tasks]), 'src/tasks.ts')).toEqual([
      expect.objectContaining({ dstName: 'run', dstQualifiedKey: 'run', confidence: 0.9 }),
    ]);
  });

  it('keeps the global fallback for an unbound bare call to a unique module-scope function', () => {
    const caller = parse('src/foo.ts', 'export function callRun() { return helperFn(); }\n');
    const target = parse('src/bar.ts', 'export function helperFn() { return 1; }\n');

    expect(callsTo(resolveEdges([caller, target]), 'src/bar.ts')).toEqual([
      expect.objectContaining({ dstName: 'helperFn', dstQualifiedKey: 'helperFn', confidence: 0.5 }),
    ]);
  });

  it('does not resolve a name imported from an external package to an unrelated in-repo symbol', () => {
    const caller = parse(
      'src/app.ts',
      'import { formatDate } from "date-lib";\nexport function main() { return formatDate(new Date()); }\n',
    );
    const unrelated = parse('src/legacy/format.ts', 'export function formatDate(d: Date) { return String(d); }\n');

    expect(callsTo(resolveEdges([caller, unrelated]), 'src/legacy/format.ts')).toEqual([]);
  });

  it('still resolves a monorepo workspace package import to the package that defines it', () => {
    const caller = parse(
      'packages/app/src/main.ts',
      'import { formatDate } from "@acme/utils";\nimport { parse } from "@babel/types";\nexport function main() { formatDate(new Date()); return parse(); }\n',
    );
    const utils = parse('packages/utils/src/dates.ts', 'export function formatDate(d: Date) { return String(d); }\n');
    const babel = parse('packages/babel-types/src/parse.ts', 'export function parse() { return 1; }\n');

    const edges = resolveEdges([caller, utils, babel]);
    expect(callsTo(edges, 'packages/utils/src/dates.ts')).toEqual([
      expect.objectContaining({ dstName: 'formatDate', confidence: 0.5 }),
    ]);
    expect(callsTo(edges, 'packages/babel-types/src/parse.ts')).toEqual([
      expect.objectContaining({ dstName: 'parse', confidence: 0.5 }),
    ]);
  });

  it('leaves non-JS languages on name-based resolution', () => {
    const caller = parse('app/main.py', 'def main():\n    return helper_fn()\n');
    const target = parse('lib/helpers.py', 'def helper_fn():\n    return 1\n');

    expect(callsTo(resolveEdges([caller, target]), 'lib/helpers.py')).toEqual([
      expect.objectContaining({ dstName: 'helper_fn', confidence: 0.5 }),
    ]);
  });
});
