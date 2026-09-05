#!/usr/bin/env node
// dispatch-check.mjs — mechanical verifier for BUILDER-PROMPT-COMPLETE.md.
// Campaign tooling: lives beside the dispatch, NOT in any repo tree. Zero
// network by default; --live adds read-only API re-probes of the §0 rows.
//
// Checks (each failure names the offending line):
//   1. every §N reference resolves to an existing section header (N.M sub-refs
//      resolve when a full N.M section header exists, else as section+sub-item)
//   2. §1 queue items numbered contiguously from 1, count == the dispatch's
//      own "queue-length: N" declaration (v5+; default 5 for v3-era files)
//   3. every RECONCILIATION LEDGER "queue item N" target exists in §1
//   4. the three tombstoned files carry the tombstone header
//   5. every §0 executed-state row carries a date (YYYY-MM-DD) or probe marker
//   6. no duplicated section headers
//
// Usage: node dispatch-check.mjs [--live]
// Exit: 0 all green · 1 failures found
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DISPATCH = join(HERE, "BUILDER-PROMPT-COMPLETE.md");
const TOMBSTONES = ["MISSION-UNIVERSAL-HOW-CONTRACT.md", "MISSION-2026-09-IX-PR-CAMPAIGN.md", "BUILDER-PROTOCOL.md"];
const TOMBSTONE_MARK = "TOMBSTONED — SUPERSEDED";

const failures = [];
const add = (check, msg) => failures.push(`[${check}] ${msg}`);

const text = readFileSync(DISPATCH, "utf8");
const lines = text.split("\n");
const at = (n) => `line ${n + 1}: ${lines[n].trim().slice(0, 90)}`;

// --- collect section headers (## N. Title and ## 0.5-style) ---
const sectionNums = new Set();
const headerCount = new Map();
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^##\s+(?:⚰️\s*)?([0-9]+(?:\.[0-9]+)?)\.?\s/);
  if (m) {
    sectionNums.add(m[1]);
    headerCount.set(lines[i], (headerCount.get(lines[i]) ?? 0) + 1);
  }
}

// --- check 1: §N and §N.M references resolve (N.M = item M inside section N) ---
const refRe = /§([0-9]+(?:\.[0-9]+)?)/g;
const sectionRange = new Map(); // num -> [startLine, endLine]
{
  const heads = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^##\s+(?:⚰️\s*)?([0-9]+(?:\.[0-9]+)?)\.?\s/);
    if (m) heads.push({ num: m[1], line: i });
  }
  heads.forEach((h, idx) => sectionRange.set(h.num, [h.line, idx + 1 < heads.length ? heads[idx + 1].line : lines.length]));
}
const subItemExists = (sec, item) => {
  const range = sectionRange.get(sec);
  if (!range) return false;
  for (let i = range[0]; i < range[1]; i++) {
    if (new RegExp(`^${item}\\.\\s+\\*\\*`).test(lines[i])) return true;
    if (/^###\s/.test(lines[i]) && lines[i].includes(`${item}.`)) return true;
    if (new RegExp(`^###\\s+${sec}\\.${item}\\.?\\s`).test(lines[i])) return true; // full "### N.M" sub-section header
  }
  return false;
};
for (let i = 0; i < lines.length; i++) {
  for (const m of lines[i].matchAll(refRe)) {
    const ref = m[1];
    if (!sectionNums.has(ref)) {
      if (ref.includes(".")) {
        const [sec, item] = ref.split(".");
        if (!sectionNums.has(sec) || !subItemExists(sec, item)) add("§-ref", `unresolved §${ref} — ${at(i)}`);
      } else add("§-ref", `unresolved §${ref} — ${at(i)}`);
    }
  }
}

// --- check 2: §1 queue items contiguous ---
{
  const q1 = lines.findIndex((l) => /^##\s+1\.\s/.test(l));
  if (q1 === -1) add("queue", "§1 not found");
  else {
    const nums = [];
    for (let i = q1 + 1; i < lines.length; i++) {
      if (/^##\s/.test(lines[i])) break;
      const m = lines[i].match(/^([0-9]+)\.\s+\*\*/);
      if (m) nums.push({ n: Number(m[1]), line: i });
    }
    nums.forEach((it, idx) => {
      if (it.n !== idx + 1) add("queue", `expected item ${idx + 1}, found ${it.n} — ${at(it.line)}`);
    });
    const declared = Number((text.match(/queue-length:\s*(\d+)/) || [])[1] || 5);
    if (nums.length !== declared) add("queue", `queue has ${nums.length} items but the dispatch declares queue-length: ${declared}`);
  }
}

// --- check 3: ledger targets exist ---
{
  const ledger = lines.findIndex((l) => /^##\s+0\.5\s/.test(l));
  if (ledger === -1) add("ledger", "§0.5 RECONCILIATION LEDGER not found");
  else {
    for (let i = ledger; i < lines.length; i++) {
      if (/^##\s/.test(lines[i]) && i !== ledger) break;
      for (const m of lines[i].matchAll(/queue item ([0-9]+)/g)) {
        const target = Number(m[1]);
        const q1 = lines.findIndex((l) => /^##\s+1\.\s/.test(l));
        let found = false;
        for (let j = q1 + 1; j < lines.length && !found; j++) {
          if (/^##\s/.test(lines[j])) break;
          if (new RegExp(`^${target}\\.\\s+\\*\\*`).test(lines[j])) found = true;
        }
        if (!found) add("ledger", `RESTORED "queue item ${target}" has no §1 target — ${at(i)}`);
      }
    }
  }
}

// --- check 4: tombstones present ---
for (const f of TOMBSTONES) {
  const p = join(HERE, f);
  if (!existsSync(p)) { add("tombstone", `${f} missing entirely`); continue; }
  const head = readFileSync(p, "utf8").slice(0, 400);
  if (!head.includes(TOMBSTONE_MARK)) add("tombstone", `${f} has no tombstone header in its first 400 chars`);
}

// --- check 5: §0 rows carry a date or probe marker ---
{
  const s0 = lines.findIndex((l) => /^##\s+0\.\s/.test(l));
  const s05 = lines.findIndex((l) => /^##\s+0\.5\s/.test(l));
  if (s0 === -1 || s05 === -1) add("state-rows", "§0 or §0.5 not found");
  else {
    for (let i = s0; i < s05; i++) {
      if (lines[i].startsWith("|") && !/^\|[-\s|:]+\|$/.test(lines[i]) && !/^\|\s*(Fact|Item)\s*\|/.test(lines[i])) {
        if (!/[0-9]{4}-[0-9]{2}-[0-9]{2}|probe|OBSERVED|VERIFIED|re-probe/i.test(lines[i])) {
          add("state-rows", `§0 row without date/probe marker — ${at(i)}`);
        }
      }
    }
  }
}

// --- check 6: duplicate section headers ---
for (const [h, n] of headerCount) {
  if (n > 1) add("dup-header", `header appears ${n}× — "${h.trim().slice(0, 70)}"`);
}

// --- optional live probes ---
if (process.argv.includes("--live")) {
  try {
    const { apiThrow } = await import("file:///C:/Users/Mose/.agents/skills/agent-principles/tools/gh-api.mjs");
    // Post-merge era (v5): #591 and #602 are merged main; the logo branch and
    // toolscan license are the live own-repo state.
    const pr = await apiThrow("/repos/ix-infrastructure/Ix/pulls/591");
    if (!pr.merged) add("live", "PR #591 not merged — §0 merge table stale");
    else if (!String(pr.merge_commit_sha || "").startsWith("39d0734"))
      add("live", `#591 merge commit unexpected: ${String(pr.merge_commit_sha || "?").slice(0, 7)} (dispatch says 39d0734…)`);
    const p602 = await apiThrow("/repos/ix-infrastructure/Ix/pulls/602");
    if (!p602.merged) add("live", "PR #602 not merged — §0 merge table stale");
    console.log(`live: #591 merged ${pr.merged_at} (${String(pr.merge_commit_sha).slice(0, 7)}) | #602 merged ${p602.merged_at}`);
    const ts = await apiThrow("/repos/Alot1z/toolscan");
    if (ts.license?.spdx_id !== "MIT") add("live", `toolscan license regressed: ${JSON.stringify(ts.license)}`);
    const tsRef = await apiThrow("/repos/Alot1z/toolscan/git/ref/heads/main");
    if (tsRef.object.sha !== "4c0b2d11b9667d8f93fac135b6e8cca995d4a81b")
      add("live", `toolscan main moved off 4c0b2d11 → ${tsRef.object.sha.slice(0, 10)} (dispatch pins the brand-pass head; prior a3e33771 superseded by an owner push 2026-09-05 16:43Z)`);
    const br = await apiThrow("/repos/Alot1z/Ix-remap/git/ref/heads/feat/tui-logo-banner");
    if (br.object.sha !== "0869a137618152f907aea3d92cc0f2f0020cd8a9") {
      add("live", `fork logo branch moved off 0869a137 → ${br.object.sha.slice(0, 10)} (dispatch pins 0869a137 — the #605 draft head)`);
    }
    const p604 = await apiThrow("/repos/ix-infrastructure/Ix/pulls/604");
    if (p604.state !== "closed") add("live", "PR #604 not closed — expected closed after the no-reviewer recreation (dispatch pins closed)");
    const p605 = await apiThrow("/repos/ix-infrastructure/Ix/pulls/605");
    if (!p605.draft) add("live", "PR #605 is NOT a draft — RULE 0 violated (dispatch pins draft:true)");
    if (p605.head.sha !== "0869a137618152f907aea3d92cc0f2f0020cd8a9")
      add("live", `PR #605 head moved: ${p605.head.sha.slice(0, 10)} (dispatch pins 0869a137)`);
    else console.log(`live: #605 draft ok (head ${p605.head.sha.slice(0, 7)})`);
    const rr605 = await apiThrow("/repos/ix-infrastructure/Ix/pulls/605/requested_reviewers");
    const rrs = (rr605.users || []).map((u) => u.login);
    if (rrs.length) add("live", `PR #605 has requested reviewers: ${rrs.join(",")} — RULE 0: no review requests on drafts (KB #6646)`);
  } catch (e) {
    add("live", `probe failed (treat as gate-missing signal, not truth): ${e.message.slice(0, 100)}`);
  }
}

// --- report ---
if (failures.length) {
  console.error(`dispatch-check: FAIL (${failures.length})`);
  for (const f of failures) console.error("  ✗ " + f);
  process.exit(1);
}
console.log(`dispatch-check: ALL GREEN — ${sectionNums.size} sections, tombstones ${TOMBSTONES.length}/${TOMBSTONES.length}${process.argv.includes("--live") ? ", live probes ok" : ""}`);
