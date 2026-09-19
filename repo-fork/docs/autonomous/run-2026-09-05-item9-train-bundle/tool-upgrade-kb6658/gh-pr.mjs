#!/usr/bin/env node
// gh-pr.mjs — API-only PR surface (create / edit / close / reopen / get).
// Companion to gh-commit.mjs. No git binary, no harness PR path — so neither
// commit messages NOR PR titles/bodies can pick up harness attribution footers.
//
// Token: resolved ONLY by ./gh-token.mjs (single KB-contract owner).
// Watermark pattern: ONLY from ./watermark.mjs (single owner).
// REST client + fail/need: ONLY from ./gh-api.mjs (single owner).
//
// Usage:
//   gh-pr.mjs create <owner/repo> <headBranch> <baseBranch> <titleFile> <bodyFile>
//       [--repo-url <upstreamRepo>]   // open the PR on a DIFFERENT repo (e.g. upstream)
//       [--draft]                     // open as a DRAFT (draft:true at create)
//                                     //   — no code-owner request until mark-ready (KB #6646);
//                                     //   absent = ready-open, unchanged behavior
//   gh-pr.mjs edit <owner/repo> <prNumber> <titleFile> <bodyFile>
//       (<titleFile>/<bodyFile> may be "-" to keep the current value)
//   gh-pr.mjs close <owner/repo> <prNumber>
//   gh-pr.mjs reopen <owner/repo> <prNumber>
//   gh-pr.mjs get <owner/repo> <prNumber> [--jq .field]
//
// Title/body become the EXACT file contents (minus one trailing newline).
// Any line matching the watermark pattern is hard-refused.

import fs from "node:fs";
import { apiPath as api, fail, need } from "./gh-api.mjs";
import { hasWatermark } from "./watermark.mjs";

const [,, cmd, ...args] = process.argv;

function verbatim(file, what) {
  if (!fs.existsSync(file)) fail(`${what} file not found: ${file}`);
  const text = fs.readFileSync(file, "utf8");
  const bad = text.split("\n").filter((l) => hasWatermark(l));
  if (bad.length) {
    fail(`${what} contains banned attribution lines:\n${bad.join("\n")}`);
  }
  return text.replace(/\n$/, "");
}

async function main() {
  if (cmd === "create") {
    const [repo, head, base, titleFile, bodyFile] = args;
    need(repo && head && base && titleFile && bodyFile,
      "create <owner/repo> <head> <base> <titleFile> <bodyFile> [--repo-url <upstream>]");
    const title = verbatim(titleFile, "title");
    const body = verbatim(bodyFile, "body");
    let apiPath = `/repos/${repo}/pulls`;
    let headParam = head;
    const urlFlag = process.argv.indexOf("--repo-url");
    if (urlFlag > -1) {
      apiPath = `/repos/${process.argv[urlFlag + 1]}/pulls`;
      headParam = `${repo.split("/")[0]}:${head}`;
    }
    const createBody = { title, head: headParam, base, body };
    // RULE 0 / KB #6646: draft:true AT CREATE is the only reviewer-free open path.
    // Absent the flag, behavior is unchanged: the PR opens ready (which auto-requests
    // code owners at ready-open and cannot be converted safely afterwards).
    if (process.argv.includes("--draft")) createBody.draft = true;
    const out = await api(apiPath, {
      method: "POST",
      body: JSON.stringify(createBody),
    });
    console.log(JSON.stringify({
      ok: true, number: out.number, state: out.state, html_url: out.html_url,
      title, draft: !!out.draft, footer_free: true,
    }, null, 2));
  } else if (cmd === "edit") {
    const [repo, prNumber, titleFile, bodyFile] = args;
    need(repo && prNumber, "edit <owner/repo> <prNumber> <titleFile|-> <bodyFile|->");
    const patch = {};
    if (titleFile && titleFile !== "-") patch.title = verbatim(titleFile, "title");
    if (bodyFile && bodyFile !== "-") patch.body = verbatim(bodyFile, "body");
    need(Object.keys(patch).length > 0, "edit: nothing to change (both files are '-')");
    const out = await api(`/repos/${repo}/pulls/${prNumber}`, {
      method: "PATCH", body: JSON.stringify(patch),
    });
    console.log(JSON.stringify({ ok: true, number: out.number, title: out.title, state: out.state }, null, 2));
  } else if (cmd === "close") {
    const [repo, prNumber] = args;
    need(repo && prNumber, "close <owner/repo> <prNumber>");
    const out = await api(`/repos/${repo}/pulls/${prNumber}`, {
      method: "PATCH", body: JSON.stringify({ state: "closed" }),
    });
    console.log(JSON.stringify({ ok: true, number: out.number, state: out.state }));
  } else if (cmd === "reopen") {
    const [repo, prNumber] = args;
    need(repo && prNumber, "reopen <owner/repo> <prNumber>");
    const out = await api(`/repos/${repo}/pulls/${prNumber}`, {
      method: "PATCH", body: JSON.stringify({ state: "open" }),
    });
    console.log(JSON.stringify({ ok: true, number: out.number, state: out.state }));
  } else if (cmd === "get") {
    const [repo, prNumber] = args;
    need(repo && prNumber, "get <owner/repo> <prNumber>");
    const out = await api(`/repos/${repo}/pulls/${prNumber}`);
    const jqFlag = process.argv.indexOf("--jq");
    if (jqFlag > -1) {
      const expr = process.argv[jqFlag + 1];
      const val = expr.replace(/^\./, "").split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), out);
      console.log(val);
    } else {
      console.log(JSON.stringify({
        number: out.number, title: out.title, body: out.body,
        state: out.state, html_url: out.html_url,
      }, null, 2));
    }
  } else {
    fail("unknown command; see header for usage");
  }
}
main().catch((e) => fail(e.message));
