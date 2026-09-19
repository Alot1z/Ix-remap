import { execFileSync } from "node:child_process";
const token = execFileSync("node", ["C:/Users/Mose/.agents/skills/agent-principles/tools/gh-token.mjs", "--print"], { encoding: "utf8" }).trim();
const H = { Authorization: `token ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "ix-train-probe" };
async function gh(path) {
  const r = await fetch("https://api.github.com" + path, { headers: H });
  if (!r.ok) throw new Error(`${r.status} ${path}: ${(await r.text()).slice(0, 300)}`);
  return r.json();
}
// upstream main head
const repo = await gh("/repos/ix-infrastructure/Ix");
console.log("UPSTREAM main head:", repo.default_branch, "->", repo.pushed_at);
const mainRef = await gh("/repos/ix-infrastructure/Ix/git/ref/heads/main");
console.log("MAIN sha:", mainRef.object.sha, mainRef.object.type);
// all open PRs upstream
const prs = await gh("/repos/ix-infrastructure/Ix/pulls?state=open&per_page=40");
console.log("\nOPEN PRs upstream:");
for (const p of prs) console.log(`  #${p.number} [${p.draft ? "DRAFT" : "ready"}] ${p.title} | head=${p.head.ref}@${p.head.sha.slice(0, 8)} (${p.head.repo ? p.head.repo.full_name : "?"}) | base=${p.base.ref}`);
// #605 detail
const p605 = await gh("/repos/ix-infrastructure/Ix/pulls/605");
console.log("\n#605:", p605.state, "draft=" + p605.draft, "head=" + p605.head.sha, "reviewers=", JSON.stringify(p605.requested_reviewers.map(r => r.login)));
// #608 issue
const i608 = await gh("/repos/ix-infrastructure/Ix/issues/608");
console.log("#608 issue:", i608.state, "| title:", i608.title);
// check held branch names on the fork
for (const br of ["feat/installer-readme-fix", "docs/contributing-draft-first", "feat/installer-skill-verbs-c3"]) {
  try {
    const b = await gh(`/repos/Alot1z/Ix/git/ref/heads/${encodeURIComponent(br)}`);
    console.log(`fork branch ${br}: EXISTS at ${b.object.sha.slice(0, 8)}`);
  } catch (e) {
    console.log(`fork branch ${br}: absent`);
  }
}
// CODEOWNERS
const co = await gh("/repos/ix-infrastructure/Ix/contents/.github/CODEOWNERS");
const buf = Buffer.from(co.content, "base64").toString("utf8");
console.log("\nCODEOWNERS:\n" + buf.split("\n").filter(l => l.trim() && !l.trim().startsWith("#")).join("\n"));
// any open PRs from the fork account anywhere?
const mine = await gh("/search/issues?q=repo:ix-infrastructure/Ix+is:pr+author:Alot1z+state:open");
console.log("\nOpen PRs authored by Alot1z:", mine.items.length, mine.items.map(i => `#${i.number}`).join(",") || "(none)");
