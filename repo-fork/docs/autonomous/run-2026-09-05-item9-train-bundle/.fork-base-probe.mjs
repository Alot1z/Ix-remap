import { execFileSync } from "node:child_process";
const token = execFileSync("node", ["C:/Users/Mose/.agents/skills/agent-principles/tools/gh-token.mjs", "--print"], { encoding: "utf8" }).trim();
const H = { Authorization: `token ${token}`, Accept: "application/vnd.github+json", "User-Agent": "ix-probe" };
const r = await fetch("https://api.github.com/repos/Alot1z/Ix", { headers: H });
const repo = await r.json();
console.log("fork default branch:", repo.default_branch);
const mb = await fetch(`https://api.github.com/repos/Alot1z/Ix/git/ref/heads/${repo.default_branch}`, { headers: H });
console.log("fork main head:", (await mb.json()).object.sha);
// does the fork already contain upstream main e8ab1926?
for (const sha of ["e8ab1926f47cbe5906894a46006d62c92a3e4584", "39d07342a7aefa86bab36c3c03ff1ec63253e1b1"]) {
  const c = await fetch(`https://api.github.com/repos/Alot1z/Ix/git/commits/${sha}`, { headers: H });
  console.log(`fork contains ${sha.slice(0, 8)}:`, c.ok ? "YES" : `NO (${c.status})`);
}
