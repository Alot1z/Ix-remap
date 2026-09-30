// Time per issue of the baseline and the current bm25Rank, over the same
// files and issue text: median of 7 runs after one warm-up.
//
//   node speed.mjs <instance_id>[,<instance_id>...] [--worktree <dir>]
//
// Without --worktree, files are read from memory (the snapshot, preloaded),
// so the time is tokenising and scoring alone. With --worktree <checkout>,
// files are read from disk through gitRepoAccess, as `ix context
// --from-issue` reads them. With --at <owner/repo>@<commit>, the dev issue's
// text is ranked against that snapshot instead (timing only, no scoring).
import { readFileSync } from "node:fs";

import * as dist from "../../dist/cli/explain/issue.js";
import { gitRepoAccess } from "../../dist/cli/explain/text-references.js";
import * as base from "./baseline-issue.mjs";
import { loadCorpus } from "./corpus.mjs";

const argv = process.argv.slice(2);
const ids = new Set(argv[0].split(","));
const wtIdx = argv.indexOf("--worktree");
const worktree = wtIdx >= 0 ? argv[wtIdx + 1] : undefined;
const atIdx = argv.indexOf("--at");
const at = atIdx >= 0 ? argv[atIdx + 1].split("@") : undefined;
const rows = readFileSync("/home/ihock/src/ix-bench/results/external/polybench_verified.jsonl", "utf8")
  .split("\n").filter(Boolean).map((l) => JSON.parse(l)).filter((r) => ids.has(r.instance_id));

function time(fn) {
  fn();
  const ms = [];
  for (let i = 0; i < 7; i++) {
    const t = process.hrtime.bigint();
    fn();
    ms.push(Number(process.hrtime.bigint() - t) / 1e6);
  }
  return ms.sort((a, b) => a - b)[3];
}

for (const row of rows) {
  const repo = worktree ? gitRepoAccess(worktree) : at ? loadCorpus(at[0], at[1]) : loadCorpus(row.repo, row.base_commit);
  const files = repo.files();
  const q = row.problem_statement;
  const bFiles = files.filter(base.isSourcePath);
  const nFiles = files.filter(dist.isSourcePath);
  const tb = time(() => base.bm25Rank(repo, bFiles, q));
  const tn = time(() => dist.bm25Rank(repo, nFiles, q));
  console.log(`${row.instance_id}${at ? ` on ${at[0]}` : ""} ${worktree ? "disk" : "memory"} files base=${bFiles.length} new=${nFiles.length} `
    + `issue=${q.length}ch  base ${tb.toFixed(0)} ms  new ${tn.toFixed(0)} ms`);
}
