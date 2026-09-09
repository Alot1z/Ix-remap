import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const dir = path.dirname(fileURLToPath(import.meta.url));
const scratch = path.join(dir, ".scratch");

const readmePath = path.join(scratch, "pr-a", "README.md");
let readme = fs.readFileSync(readmePath, "utf8");

// ---- 1. Native-loading overclaim: drop "Gemini CLI," and "Cursor, and more." ----
// Anchor: the "Agents (...)" line must end "Codex CLI, Gemini CLI,"
const anchor1 = "(`~/.claude/skills`), Agents (`~/.agents/skills`), Codex CLI, Gemini CLI,";
const idx1 = readme.indexOf(anchor1);
if (idx1 === -1) throw new Error("README anchor 1 (Codex CLI, Gemini CLI) NOT FOUND");
if (readme.indexOf(anchor1, idx1 + anchor1.length) !== -1) throw new Error("README anchor 1 matched more than once");
readme = readme.replace(anchor1, "(`~/.claude/skills`), Agents (`~/.agents/skills`), Codex CLI (`~/.codex/skills`),");

// Next line must be the "Cursor, and more." wrap
const anchor1b = "Cursor, and more.";
const idx1b = readme.indexOf(anchor1b);
if (idx1b === -1) throw new Error("README anchor 1b ('Cursor, and more.') NOT FOUND");
if (readme.indexOf(anchor1b, idx1b + anchor1b.length) !== -1) throw new Error("README anchor 1b matched more than once");
readme = readme.replace(anchor1b, "and Cursor (`~/.cursor/skills-cursor`).");

// ---- 2. Deploy targets: drop Gemini's line, correct Cursor path ----
const anchor2 = "Codex's `~/.codex/skills`, Gemini's";
const idx2 = readme.indexOf(anchor2);
if (idx2 === -1) throw new Error("README anchor 2 (Gemini's deploy target) NOT FOUND");
if (readme.indexOf(anchor2, idx2 + anchor2.length) !== -1) throw new Error("README anchor 2 matched more than once");
readme = readme.replace(anchor2, "Codex's `~/.codex/skills`, and");

const anchor2b = "`~/.gemini/skills`, Cursor's `~/.cursor/skills`, and more";
const idx2b = readme.indexOf(anchor2b);
if (idx2b === -1) throw new Error("README anchor 2b (~/.gemini/skills ... ~/.cursor/skills) NOT FOUND");
if (readme.indexOf(anchor2b, idx2b + anchor2b.length) !== -1) throw new Error("README anchor 2b matched more than once");
readme = readme.replace(anchor2b, "Cursor's `~/.cursor/skills-cursor`");

// ---- 3. Example command: claude gemini -> claude agents ----
const anchor3 = "bash scripts/install-skill.sh claude gemini";
const idx3 = readme.indexOf(anchor3);
if (idx3 === -1) throw new Error("README anchor 3 (claude gemini example) NOT FOUND");
if (readme.indexOf(anchor3, idx3 + anchor3.length) !== -1) throw new Error("README anchor 3 matched more than once");
readme = readme.replace(anchor3, "bash scripts/install-skill.sh claude agents");

fs.writeFileSync(readmePath, readme);

// ---- CONTRIBUTING: one line added to step 4 ----
const contribPath = path.join(scratch, "pr-b", "CONTRIBUTING.md");
let contrib = fs.readFileSync(contribPath, "utf8");
const oldStep = "4. Open a PR using the pull request template";
const idxC = contrib.indexOf(oldStep);
if (idxC === -1) throw new Error("CONTRIBUTING step 4 anchor NOT FOUND");
if (contrib.indexOf(oldStep, idxC + oldStep.length) !== -1) throw new Error("CONTRIBUTING step 4 matched more than once");
const newStep =
  "4. Open a PR using the pull request template — work-in-progress opens as a draft;\n" +
  "   GitHub requests code owners at mark-ready, not at draft-open, and a ready-open\n" +
  "   auto-request cannot be removed once a PR is a draft (see #608)";
contrib = contrib.replace(oldStep, newStep);
fs.writeFileSync(contribPath, contrib);

console.log("All anchors matched exactly once. Fixes applied.");
