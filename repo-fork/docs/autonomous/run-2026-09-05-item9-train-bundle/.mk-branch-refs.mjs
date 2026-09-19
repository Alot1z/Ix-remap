import { execFileSync } from "node:child_process";
const token = execFileSync("node", ["C:/Users/Mose/.agents/skills/agent-principles/tools/gh-token.mjs", "--print"], { encoding: "utf8" }).trim();
const BASE = "e8ab1926f47cbe5906894a46006d62c92a3e4584";
const H = { Authorization: `token ${token}`, Accept: "application/vnd.github+json", "User-Agent": "ix-open" };
async function createRef(branch) {
  const r = await fetch("https://api.github.com/repos/Alot1z/Ix/git/refs", {
    method: "POST", headers: H, body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: BASE }),
  });
  if (r.status !== 201) throw new Error(`create ${branch}: ${r.status} ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  console.log(`created ${branch} -> ${j.object.sha.slice(0, 10)}`);
}
await createRef("feat/installer-readme-fix");
await createRef("docs/contributing-draft-first");
console.log("refs done");
