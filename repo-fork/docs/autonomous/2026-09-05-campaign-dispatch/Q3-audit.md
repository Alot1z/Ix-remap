# Q3 — Five-PR Full-Depth Audit (2026-09-05, read-only)

Probes per PR (§10 contract): pulls/{n} · commits/{head} · commits?sha={head} (skew) ·
compare main↔head (behind/ahead) · check-runs (CI) · pulls/{n}/reviews (formal) ·
pulls/{n}/comments (inline) · issues/{n}/comments (thread) · pulls/{n}/files.

## Head + CI (verified live this session)

| PR | Title | Head SHA | CI (check-runs) | State | Mergeable |
|---|---|---|---|---|---|
| #584 | ci(parity): gate registered flags against the flag reference (#576) | `6e2d3ba1da6926972a13eb48d4c05ec5823e74b2` | 20/20 success | open | true |
| #587 | docs: API-reference parity gate (four surfaces) | `adadd961318540794c6385d9d51675f4fc09c21c` | 20/20 success | open | true |
| #589 | docs(readme): add a docs index so the nav link lands on a home | `510639e06c45e7b52c19e7c0d1ff1d0e6133ff53` | 18/18 success | open | true |
| #590 | ci: fail on dead markdown links | `4812866be40d4deca2abbf1668dfcb7fe1fefec8` | 39/39 success | open | true |
| #591 | feat(install): drive harness presence from toolscan discovery | `608c98638636b62ae96d699e7b9680a2c80d0940` | 22/22 success | open | true |

## Force-push history (skew method, §10.1 — INFERENCE labels)

The API has no force-push listing; skew (committer date > author date = rewrite time) is INFERENCE
until a commit list confirms — both halves executed here.

| PR | Skewed commits (INFERENCE → rewrite-time) | Reading |
|---|---|---|
| #584 | `c961528b7f` C+23:14h · `b8f93f5084` C+5:19h · `6e2d3ba1da` C+2:50h | One rebuild batch at 2026-09-03T23:25 (the force-push KageBinary caught: "response commit not on the branch, head cc138ac") + second rebuild 2026-09-04T00:07 producing current head. Both rebuilds confirmed by thread history (OBSERVED). |
| #587 | `8f27e4af72`/`4813132895`/`bacdbc5f23` C@2026-09-04T08:40 · `adadd96131` C@08:42 | Rebuild batch 08:40-08:42 = the 085aacf→adadd96 sequence reviewed in-thread (OBSERVED). |
| #589 | `ac8311cfae` C+1:24h | Single rewrite 2026-09-04T00:11 = current head itself (fresh commit, re-dated). No review complaint; no loss signal. |
| #590 | none | Head commits carry matching dates; the in-thread force-push history (b675596→4812866) predates the current head and is OBSERVED from the thread. |
| #591 | 14 commits re-dated C@2026-09-04T08:42 | One comprehensive history rebuild before the 608c986 verification (OBSERVED in thread: "New head: a9f7423" → later 608c986). Nothing clobbered — reviewer re-verified all findings on 608c986. |

## Review-thread state (formal reviews: ZERO on all five — reviewer discussion lives in issue-comments)

| PR | Reviewer verdicts (issue-comments, OBSERVED) | Open threads |
|---|---|---|
| #584 | KageBinary: "The lost commits are back and every finding I raised is fixed. Re-verified on `6e2d3ba`, from a built ix-cli" (5544431912) | **none** |
| #587 | KageBinary: "`adadd96` fixes the hole I reported — verified against the real gate on this head, not just by reading the registry" (5544415856) | **none** |
| #589 | No review complaints in thread (docs-index PR; informational CI only) | **none** |
| #590 | KageBinary: "`4812866` is back on the branch and it does what the commit says. Re-verified on that head by running the gate" (5544454523) | **none** |
| #591 | KageBinary: "Both residuals are closed… Re-verified on `608c986`… No open findings from me — this is good to land" (5544473030); then governance comment 5547541291 awaiting his PORT/KEEP/SPLIT choice | **1 — the governance decision (maintainer's ball)** |

## Branch ancestry vs main

main head `fb46941e6a0b`; main's two newest commits (fix(ingest) #572 follow-ups by Joseph Mikhail)
touch: ix-cli ingest/map/parse-pool/single-flight/stitch-guard internals + `docs/api/README.md`.

| PR | ahead/behind | File overlap with main-only commits | Needs rebase? |
|---|---|---|---|
| #584 | +3 / −2 | **none** (ci.yml + check-doc-parity.mjs vs ingest internals; `docs/api/README.md` is NOT in #584's file set) | **no** — mergeable=true, CI tests the merge result |
| #587 | +4 / 0 | current with main | no |
| #589 | +3 / −2 | **none** (.gitignore/README/docs/README/scripts/install-skill.sh vs ingest internals) | **no** |
| #590 | +3 / −2 | **none** (ci.yml + check-links.mjs) | **no** |
| #591 | +20 / 0 | current with main | no |

## Dispositions

| PR | Disposition | Feeds item 5? |
|---|---|---|
| #584 | CLEAN — reviewer-verified head, CI green, no overlap with main's delta | no |
| #587 | CLEAN — current with main, reviewer-verified | no |
| #589 | CLEAN — green CI, no overlap | no |
| #590 | CLEAN — reviewer-verified head | no |
| #591 | CLEAN — "good to land"; sole open thread is the maintainer's governance choice (item 1 poll / §8 playbook) | no |

**Item 5 (rebase-after-audit): ZERO executions — no PR carries a needs-rebase disposition.**
Rationale: behind-by-2 cases share no files with main's delta (GitHub merge is clean, CI on merge
runs the merged code), and rebasing reviewer-verified heads would move verification targets after
the fact — the exact force-push-clobber anti-pattern #584's thread already litigated.

## Per-file audit notes (§10.2-3 spot-verdicts; full per-line review was done at each PR's own review cycle)

- No branding/watermark lines in any head's commit messages (scan-verified historically; the
  governance/verify runs each cycle confirmed footer-free).
- Docs↔code: #587's parity trio matches the gate #591's ci.yml wires (same four files in both PRs —
  #587 lands first as the dependency; #591 adds the ci.yml legs + smoke + toolscan seam).
- Merge-order dependency discovered (INFERENCE from file overlap): #587 ⊂ #591 (4 shared files) —
  merge #587 before #591 or #591's ci.yml/api-docs edits will need a rebase dance. #590∩#584∩#591
  share only ci.yml (different jobs — YAML-mergeable).
