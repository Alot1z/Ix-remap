import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
const dir = path.dirname(fileURLToPath(import.meta.url));
const tools = "C:/Users/Mose/.agents/skills/agent-principles/tools";
const { apiPath: api } = await import(pathToFileURL(path.join(tools, "gh-api.mjs")));

const ROOT = path.join(dir, "..", "..", "..", "..", "..");
const A = path.join(dir, "..", "run-2026-09-05-item2-installer-audit");
const B = path.join(dir, "..", "run-2026-09-05-issue-codeowners");

const expect = [
  { n: 605, file: path.join(dir, ".logo-pr-body-v2.md") },
  { n: 609, file: path.join(A, "installer-pr-body.md") },
  { n: 610, file: path.join(B, "fix-pr-body.md") },
];

for (const e of expect) {
  const p = await api(`/repos/ix-infrastructure/Ix/pulls/${e.n}`);
  const local = fs.readFileSync(e.file, "utf8").replace(/\n$/, "");
  const match = p.body === local;
  console.log(`#${e.n}: draft=${p.draft} state=${p.state} head=${p.head.sha.slice(0, 10)} reviewers=[${p.requested_reviewers.map((r) => r.login).join(",")}] body_verbatim=${match} changed_files=${p.changed_files}`);
  if (!p.draft || p.requested_reviewers.length !== 0 || !match) throw new Error(`#${e.n} FAILED verify`);
  // CI status
  const checks = await api(`/repos/ix-infrastructure/Ix/commits/${p.head.sha}/check-runs?per_page=100`);
  const by = {};
  for (const c of checks.check_runs) by[c.conclusion ?? c.status] = (by[c.conclusion ?? c.status] ?? 0) + 1;
  console.log(`   CI on head: ${JSON.stringify(by)}`);
}
// open-PR surface
const open = await api("/repos/ix-infrastructure/Ix/pulls?state=open&per_page=30");
console.log("\nAll open PRs upstream:");
for (const p of open) console.log(`  #${p.number} [${p.draft ? "DRAFT" : "ready"}] ${p.title}`);
console.log("ALL VERIFIED");
