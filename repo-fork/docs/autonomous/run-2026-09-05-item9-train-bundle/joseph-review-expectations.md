# josephismikhail review expectations — distilled from the comment crawl (2026-09-05)

Source: bounded crawl of `reviewed-by:josephismikhail` in ix-infrastructure/Ix (66 total; sampled #593, #570, #592, #578, #577, #582, #466, #465). Full comment digest: `joseph-findings2.json`. KB row #66xx (this session). Related: KB #6649 (who he is), #6650 (Refs-not-Closes).

## The pattern
He reviews in **many COMMENTED rounds** (3–7 per PR), approves late after fixes land on the branch, and his comments are long-form with a bolded thesis lead, code-path citations, and usually a concrete alternative. He writes comments as carefully drafted text (composed in scratch files, then posted) — not off-the-cuff notes.

## What he actually checks (expectations E1–E8)
1. **Doc samples must be producible by the shipped command.** Every printed value is verified against the real code path — a fabricated or hand-waved output number is caught (`llm-format.md`: `202.71` vs the code's `202.72`; a `scope=session`-only sample missing the lifetime rows the renderer always emits).
2. **Claims scoped to a mode/edition must hold on that scope.** OSS-vs-`@ix/pro` differences (stubs vs real subcommands) are checked line-by-line.
3. **Relative links must resolve from the file's actual location** — and text meant to be pasted into a PR/issue body must not rely on repo-tree-relative hrefs (GitHub does not rewrite them in bodies).
4. **Wire capability gates doc claims.** No session id/header on the call ⇒ "session" is not a mechanism the CLI supports — he checks the client's actual request before believing prose.
5. **Audit/parity tooling must actually bind:** Commander negation defaults (`--no-x` leaves `defaultValue` undefined), root-program options never walked, dedup hiding per-command drift, lint/knip scopes that exclude `scripts/`. He audits the audit.
6. **Test reasoning must be sound under real semantics:** `fs.existsSync` follows symlinks; git error strings go through gettext (locale-dependent); an idempotent-count proves nothing about files never submitted.
7. **`Closes` only when the issue is fully resolved** — otherwise `Refs` + a follow-up tracker stays open (the #574 scope note; KB #6650).
8. **Expect iteration, not one-shot approval.** Multiple COMMENTED rounds are normal; respond by pushing fixes to the branch, keep the diagnosis narrative tight ("diagnosis right; mechanism wrong" reads well), and never treat silence between rounds as rejection.

## What this means for the campaign's PRs
- Run every example before opening (or say it was not run).
- Keep doc claims inside what the wire + the edition actually do.
- Recheck relative links from their final home; make PR-template text paste-safe.
- The reviewer is the repo owner — draft PRs will be read; open them tight.
