import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
const dir = path.dirname(fileURLToPath(import.meta.url));
const tools = "C:/Users/Mose/.agents/skills/agent-principles/tools";
const { apiPath: api } = await import(pathToFileURL(path.join(tools, "gh-api.mjs")));
const { hasWatermark } = await import(pathToFileURL(path.join(tools, "watermark.mjs")));

function verbatim(file, what) {
  const text = fs.readFileSync(file, "utf8");
  const bad = text.split("\n").filter((l) => hasWatermark(l));
  if (bad.length) throw new Error(`${what} contains banned lines: ${bad.join(" | ")}`);
  return text.replace(/\n$/, "");
}
function rel(p) { return path.join(dir, p); }

const A = path.join(dir, "..", "run-2026-09-05-item2-installer-audit");
const B = path.join(dir, "..", "run-2026-09-05-issue-codeowners");
const jobs = [
  {
    head: "feat/installer-readme-fix",
    title: verbatim(path.join(A, "installer-pr-title.txt"), "title A"),
    body: verbatim(path.join(A, "installer-pr-body.md"), "body A"),
  },
  {
    head: "docs/contributing-draft-first",
    title: verbatim(path.join(B, "fix-pr-title.txt"), "title B"),
    body: verbatim(path.join(B, "fix-pr-body.md"), "body B"),
  },
];

for (const j of jobs) {
  const out = await api("/repos/ix-infrastructure/Ix/pulls", {
    method: "POST",
    body: JSON.stringify({ title: j.title, head: `Alot1z:${j.head}`, base: "main", body: j.body, draft: true }),
  });
  console.log(JSON.stringify({ opened: true, number: out.number, draft: out.draft, state: out.state, url: out.html_url, title: out.title }, null, 2));
  const chk = await api(`/repos/ix-infrastructure/Ix/pulls/${out.number}`);
  console.log(`  post-open verify #${out.number}: draft=${chk.draft} requested_reviewers=[${chk.requested_reviewers.map((r) => r.login).join(",")}] mergeable_state=${chk.mergeable_state}`);
  if (!chk.draft || chk.requested_reviewers.length !== 0) throw new Error(`#${out.number} NOT draft-from-open with zero reviewers — investigate`);
}
console.log("both drafts open, zero reviewers");
