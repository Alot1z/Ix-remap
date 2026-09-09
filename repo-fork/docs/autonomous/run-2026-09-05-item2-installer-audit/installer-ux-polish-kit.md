# Installer UX polish kit — drafted from the hermetic demo (2026-09-05)

Source evidence: `../run-2026-09-05-item9-train-bundle/install-demo/` — the
hermetic demo run of the **merged** installer (registry version, `39d0734`;
`git diff 39d0734 origin/main -- scripts/install-skill.sh` is empty as of this
kit, so every line reference below holds on current main `e8ab1926`).

Status: **PROPOSAL KIT — held local, nothing opens.** None of this is promised
anywhere. If the owner wants any of it, it becomes one docs-or-chore PR in the
train style (draft-from-open, welcome-feedback body); the script changes are
labeled by whether they alter behavior or output text only.

## What the demo actually showed (evidence, not invention)

From `transcript.txt`:

1. `--dry-run --json` output is good and complete (per-host `id` / `action` /
   `dest` / `detectedVia`) — no change proposed there.
2. The human real run prints one `Installed: <abs path>` line per host, then a
   two-line footer. A reader sees four long identical-looking paths scroll by
   with **no label of which harness each path belongs to** and no summary
   count until the footer.
3. The dry-run human output says `would install: <abs path>` — same shape, so
   the same label gap exists in previews.
4. `--dry-run` without `--json` does not say anywhere that a JSON variant
   exists, and the `Usage:` header comment documents it, but the script's own
   `--help`-equivalent surface (the header) is only visible by reading the
   file, not by running it.
5. `error: unknown harness id 'gemini'` + `valid ids: claude agents codex
   cursor` is correct and clean — no change needed (the demo re-verified the
   exit-1 behavior that #609's README fix documents).

## Proposed changes (concrete, smallest-first)

### U1 — label each install line with the harness id (output text only)

`say "Installed: $dest"` → `say "Installed [$id]: $dest"`; dry-run line →
`say "would install [$id]: $dest"`.

Why: the demo's four paths are distinguishable only by `.claude` vs `.agents`
vs `.codex` vs `.cursor` substrings buried mid-path; the id is already in hand
in the loop. Cost: zero behavior change.

**CI compat (verified):** `ci.yml:374/479` greps
`grep -Fq 'would install: /tmp/ix-harness-home/.claude/skills/ix'` (posix job)
and `grep -Fq "would install: $dest"` (windows job). Both assertions **break**
if the line gains the `[$id]` token — the kit therefore includes the two-line
CI assertion update (`'would install [$id]: /tmp/...'` / `"would install
[$id]: $dest"`) in the same PR. No other CI grep touches these lines
(`--json` assertions are field-based and unaffected).

### U2 — per-host summary table before the footer (output text only)

After the loop, before the existing footer, print a compact aligned table:

```
Harness   Action     Destination                          Detected via
claude    installed  ~/.claude/skills/ix                  path
agents    installed  ~/.agents/skills/ix                  config-dir
codex     installed  ~/.codex/skills/ix                   path
cursor    installed  ~/.cursor/skills-cursor/ix           config-dir
```

Implementation sketch: emit from the existing `DECISIONS` array (it already
holds `id/action/dest/via` — the table needs no new state); print `~`-folded
dests to keep lines short (the absolute path stays available in `--json`).
Skips and refusals appear with their real action (`skip` / `refused`), so the
table is honest, not promotional.

CI compat: table lines are new output; existing greps assert
substring presence, not absence, so nothing breaks. The windows job's
`test ! -e "$dest"` and the refusal/exit-1 parity tests are unaffected.

### U3 — a real `--help` (output text only)

Today unknown options exit 1 (`error: unknown option ...`), which is right,
but there is no way to *discover* flags from the CLI itself. Add:

- `--help` / `-h`: print the four-line usage block (mirroring the header
  comment verbatim, including the `--dry-run --json` line) + the valid ids
  from the registry, exit 0.
- Keep the unknown-option error, and append `try: bash scripts/install-skill.sh --help`.

### U4 — dry-run footer names the JSON variant (output text only)

Dry-run footer gains one line:

```
Add --json for a machine-readable report (same shape as ix mcp install).
```

Why: the demo reviewer (and a new user) has no in-band signal that `--json`
exists; the shape-parity claim is already true (`hosts[].action` values mirror
`ix mcp install`'s report per the code comment at the `DECISIONS` block).

### Not proposed (deliberately)

- **No `--prefix`/`--root` flag.** The hermetic seam is `HOME` redirection;
  adding a second install-root mechanism duplicates what `$HOME` already does
  and widens the rm-rf blast radius (the audit's finding-e context). The demo
  stays `HOME`-based.
- **No progress bars / spinners.** Four fast copies; animated output adds
  TTY-conditional complexity for no observable gain in the transcript.
- **No colored output.** `chalk` is available in ix-cli but the shell script
  deliberately avoids color (CI greps raw lines; NO_COLOR semantics would need
  defining). Not worth it for four lines.
- **No change to the guard order, exit codes, or JSON shape.** The audit
  verified those as sound; the registry's deliberate gemini exclusion is
  upstream's design and stays untouched.

## Ride-along shape (if the owner green-lights)

One PR: `chore(install): label installer output per host and add --help`
— touches only `scripts/install-skill.sh` (+ the two CI assertion lines) +
the README install section lines that #609 already corrects (coordinated so
the two PRs' README hunks don't collide; if #609 merges first this rebases
clean). Draft-from-open, universal welcome-feedback body, zero reviewers
until mark-ready. Nothing here opens without the owner's go.
