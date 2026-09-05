# Ix-native harness detection — design (plan-only)

Status: proposal document. No code ships from this file. If the #591 seam decision lands as
PORT, this document becomes the implementation plan for the built-in discovery; if KEEP, it
becomes the C1 registry proposal (see `docs/` C1/C3 preps). Written against the descriptor
table that actually exists in `ix-cli/src/mcp/hosts.ts` (7 hosts, verified 2026-09-05 at
`608c986`), not against an imagined one.

Purpose: make harness presence detection **registry-driven, structurally verified, and
hermetically testable** — replacing per-host bespoke probes with one descriptor contract the
tests can enumerate. The quality bar is the installer bar (D4): a probe that cannot fail must
not count as detection [KB #6455 — VERIFIED: always-true `~/.vscode`-style probes listed
hosts that were not installed], host listings are parsed structurally, never with prose
regexes [KB #6525 — VERIFIED], and Windows copy semantics follow the junction hazard rules
[KB #6274 — VERIFIED].

---

## 1. Descriptor table (the contract)

One data row per harness. `hosts.ts` remains the registry of truth; the descriptor table is
its normalised, test-enumerable form. Every row answers five questions and nothing else:

| id | bin | probe type | registration method | parse mode |
|---|---|---|---|---|
| `claude` | `claude` | CLI presence (`claude mcp list` runs and exits 0) | CLI write (`claude mcp add …`) | stdout list + embedded-JSON entry |
| `codex` | `codex` | CLI presence + config file shape (`~/.codex/config.toml`) | CLI write | stdout list + embedded-JSON entry |
| `gemini` | `gemini` | CLI presence + config file shape (`~/.gemini/settings.json`) | CLI write | stdout list + embedded-JSON entry |
| `openclaw` | `openclaw` | CLI presence + config file shape (`~/.openclaw/openclaw.json`) | CLI write; **Windows writes the documented JSON shape directly** (JSON argv cannot pass through `cmd`), read always stays on `openclaw mcp show` so a wrong key reports `not registered` instead of lying `already registered` | stdout list via `mcp show` (names only) + embedded-JSON entry |
| `vscode` | `code` | file+shape: user-profile config exists AND parses AND has a `servers` object | direct JSON write to the same file `inspect` reads (no `code --add-mcp`: it needs `code` on PATH, which GUI-only installs lack, and passes JSON argv, which Windows cannot encode) | JSON file, structural (`servers` key) |
| `cursor` | `cursor` | file+shape: `~/.cursor/mcp.json` exists AND parses AND has `mcpServers` | direct JSON write | JSON file, structural (`mcpServers` key) |
| `opencode` | `opencode` | file+shape: `~/.config/opencode/opencode.json` exists AND parses AND has `mcp` | direct JSON write, shape per `opencode.ai/config.json` (`type: "local"`, `command` array, `enabled`) — schema forbids extra properties | JSON file, structural (`mcp` key) |

Column rules:

- **probe type** is one of exactly two kinds: `cli` (the host binary answers) or `file+shape`
  (the config file exists, parses, and carries the expected key). A bare directory or binary
  name alone is never a row. This is the #6455 rule as a type system: any new row must pick a
  kind whose failure is observable, and the test battery (§2) pins that each row's probe CAN
  fail.
- **registration method** names the write path and, when a host has a split write
  (Windows-only direct write), says so in the row — the openclaw/vscode rows are the worked
  examples. Read and write paths are matched pairs: the read must be able to see what the
  write produced, or the row documents why not (openclaw keeps the read on the CLI on every
  platform deliberately).
- **parse mode** names the structural parser. No row is allowed to say "regex on prose". The
  parsers that exist today: JSON with comment-stripping (claude/codex/gemini embedded
  objects), JSON file with a required root key (vscode/cursor/opencode), and stdout of
  `mcp list` where the host owns the format.

## 2. Structural probe battery (per row, the tests that must exist)

For every descriptor row, the battery pins four behaviours — the "probe-VERIFIED" standard:

1. **Positive**: with the probe's evidence present in a fixture tree, the host reports
   installed. The fixture is the *minimum* evidence (a claude fixture is a fake `claude`
   executable + nothing else; a cursor fixture is a config file with `mcpServers` + nothing
   else).
2. **Negative**: with the evidence absent, the host reports not-installed — never a guess.
   For `file+shape` rows this is three separate cases: file missing; file present but
   unparseable; file present and parseable but the expected key absent. All three are
   not-installed, and the test asserts each separately (an unparseable file must not degrade
   to "present because the path exists" — that is the #6455 failure shape again).
3. **Fail-ability pin** (the anti-always-true test): the battery *proves the probe can fail*
   by mutation — delete the evidence from the positive fixture and assert the verdict flips.
   A probe whose positive and negative fixtures produce the same verdict is a defect the
   battery catches at authoring time.
4. **Cross-check**: CLI rows assert the config target the CLI writes is the same file the
   descriptor's `target` names, so the two probe kinds stay anchored to the same registration.

## 3. Hermetic cases (closed ports, closed paths)

Every test runs against fixture trees and fake executables, never the developer's real
`~/.claude`/`~/.cursor`/… — the real home directory is never touched. Hermetic rules:

- **HOME override**: each test points the home-resolution seam at a per-test temp directory
  (created, populated with fixtures, removed). No test reads the real user config.
- **Closed-port rule** [KB #6310-class discipline]: anything that could listen (a mock MCP
  server, a stubbed backend) binds port `0` (OS-assigned) or is never bound at all — the
  battery contains no network. Harness probes are file/CLI probes; a network probe would be a
  third probe type and would need its own hermetic story before it exists.
- **Fake executables**: CLI-class fixtures are tiny scripts that exit 0/1 on demand. On
  Windows the `.cmd` shim variant ships beside the POSIX one (the existing
  `.github/fixtures/harness-smoke/claude` + `claude.cmd` pair is the pattern). Fakes are
  never resolved from `PATH` — the probe receives the fixture path explicitly, so a real
  `claude` on the developer's machine cannot leak into results, and a fake planted on PATH is
  *by contract* never executed (the opt-in-only execution pin, tested, mirrors the #591 seam
  rule).
- **Clean machine = zero detections**: a fresh temp home with no fixtures yields an empty
  install list and exit 0. This is the CI case: it must be byte-stable on GitHub runners and
  on a bare container.

## 4. Mutation tests (the battery tests the tests)

Per the house rule (mutation-first, both directions):

- **Detector mutations**: flip each row's positive fixture to negative (rename the key,
  corrupt the JSON, remove the fake binary) → the battery must go red. If a mutation passes
  the battery, the row's probe is not actually observing the evidence.
- **Battery mutations** (the KB #6308 lesson — a verification harness gets the same scrutiny
  as the code): neuter one battery assertion (e.g. make the negative case accept "file
  exists") → a dedicated pin asserts the battery itself fails on the neutered build. This is
  what stops the always-true-probe class from re-entering through a test edit.
- **Registration mutations**: change one descriptor's config key (`mcpServers` → `servers`)
  → the cross-check in §2.4 goes red for the cursor row.

## 5. Windows copy-default rationale [KB #6274 — VERIFIED]

Default to **copy**, never symlink, for every artifact the installer/detector places on
Windows: `git worktree remove --force` (and any recursive cleanup) walks junctions and
deletes the junction *target's* contents — a symlinked skill directory inside a worktree is
exactly that hazard. Concretely:

- skill deployment (`scripts/install-skill.sh`) already installs real files; the detector
  design keeps that invariant: detection reads shape, installation writes copies, nothing in
  the Ix tree creates a junction/symlink on win32.
- where a user-level canonical store + per-harness link would be nice-to-have (dedupe across
  four roots), the design accepts the duplication instead of the link on Windows; `--copy`
  semantics (the skills.sh pattern) remain available explicitly on POSIX.
- phantom-mass deletion symptom (mass `D <path>` outside the worktree) is documented as the
  stop-and-restore signal in `skills/ix/references/troubleshooting.md`.

## 6. Module sets (`--set`)

The only transferable idea taken from BMAD-METHOD (D3: the projects are orthogonal — module
sets, nothing else): the installer accepts `--set <name>` to select a bundle of harness ids
and artifacts. Proposed sets, data-driven from the same descriptor registry (no second
list):

- `--set core` (default): every descriptor row's MCP registration + `skills/ix` deployment.
- `--set ix-review`: the review-side artifacts only (skill docs, no MCP registration).
- `--set ix-core|ix-review|…`: named module groups; a set names ids and files, the
  executor resolves them through the same registry the probes use, so a set can never
  reference a harness the registry does not know (unknown id = usage error, exit 1 — the
  #591 rule "reject unknown harness ids" generalized).

A set is a *filter over the registry*, never a parallel list: adding a harness adds it to
sets by editing one data row.

## 7. Credit

Detection quality shaped by skills.sh (vercel-labs/skills): per-harness registry, structural
detection over prose guessing, and credential discipline that never copies the token into a
process. This document is the artifact where that capability is being rebuilt for Ix — hence
the credit lives here (D2 rule: credit rides only on artifacts that contain the capability).

## 8. Non-goals

- No network probes (§3).
- No silent best-effort installs: unknown id, unparseable config with `--force` absent,
  or a probe whose evidence cannot be verified → refuse with the reason (D4).
- No external discovery deciding installation on its own: an optional discovery pass is
  opt-in evidence *at most* (the #591 seam contract: bounded, truncated-truthful, env-gated),
  never the decider.
