# TO: PLANNER — emit the v3 dispatch
**Source: the builder's dry-run of your v2 (read-only, live probes, 2026-09-05).**

The simulation validated your structure and bought live data, but it surfaced 6 defects, 2 honesty-bar traps, and 1 unresolved contradiction. Apply exactly the deltas below; anything beyond them goes through a new D-LOG row, never a silent edit.

## A. Six defect fixes (builder's findings, mapped to edits)

1. **HIGH — path root half-pinned.** §0 gains one line: "All relative paths resolve from `E:/E-github-repos/Ix-remap`." §6/§12 relative references conform to it.
2. **MED — no Q3 output contract.** §10 gains: probe JSON persists at `<run-dir>/Q3-audit.json`; the disposition table also lands in the final report AND the campaign record; artifacts are durable, never report-only.
3. **MED — force-push method unspecified.** §10 names the method: per-branch compare API + retained PushEvents + author/committer-date skew **explicitly labeled INFERENCE**. Skew alone is never presented as a verified force-push.
4. **LOW — reviews probe ambiguity.** §10 lists the endpoint battery — `pulls/{n}/reviews` (formal), `pulls/{n}/comments` (review comments), `issues/{n}/comments` (issue comments), timeline for thread-resolution state — and defines per-endpoint empty semantics: "no formal reviews" ≠ "probe failed" ≠ "no open threads".
5. **LOW — queue stalling.** §1 gains: "authorization-gated item → record BLOCKED(b/c) auth boundary and continue the queue; never stall."
6. **LOW — CI naming drift.** §0's parity row gains: "(job id `api-parity`, check-run name `API-reference parity`)".

## B. Absorb the simulation state — without laundering it

- **Poll:** no maintainer reply as of 2026-09-05; comment `5547541291` remains the newest of 9; head `608c986386` unmoved. Record timestamped. Poll cadence: session start + after each completed queue item.
- **Q3: mark PARTIAL — probe-level done, thread-level audit NOT done** (reviews battery unresolved; PR titles missing for #584/#587/#589 in the sim table). The real run redoes the full read-only probe, using the simulation as the method template. Do NOT mark Q3 DONE.
- Sim dispositions (HOLD ×4; AWAITING-MAINTAINER ×1) enter as **working hypotheses to re-verify**, not findings.
- Mergeable/blocked note: all five PRs `mergeable: true` with `mergeable_state: blocked` (review-policy block, not conflicts) → the parked "rebase after audit" item has zero current inputs; keep it parked with that note, do not delete it.

## C. Force the one contradiction to resolution

§6 substrate claims #591 had "three review rounds, verdict 'no open findings'" — yet the reviews API returned empty for all five PRs. Either those rounds live in issue comments / review threads (likely) or the substrate claim is mis-sourced. The v3 Q3 spec must locate where the rounds actually live, cite the exact endpoint, and correct §6 if the claim is wrong. Likewise #584/#587 "rewrite at head" is INFERENCE — the real run converts it to VERIFIED (compare/events evidence) or drops it.

## D. Carry-overs from the v1→v2 review — confirm present, add if missing

- §8 **MERGED-without-reply branch** (merge + silence → the disclosure stands; the port becomes a fresh proposal/issue).
- **Gated-surface-unreachable stop** in §3/§5: gate missing → upstream writes impossible → report BLOCKED(b) and continue non-upstream items only; never ungated writes.
- **One-line authorization matrix:** `Alot1z/*` writes pre-authorized via the gated surface; ix-infrastructure/Ix writes, PR opens, and upstream comments require explicit authorization each.
- **Reconciliation ledger** gains a v2→v3 section covering every delta in this brief.

## E. v3 acceptance oracle — self-check before emitting

- [ ] §0 path-root line
- [ ] §10 output contract + endpoint battery + empty semantics + force-push method
- [ ] §1 anti-stall rule
- [ ] CI dual naming
- [ ] §8 MERGED branch
- [ ] gate-unreachable stop
- [ ] authorization matrix line
- [ ] Q3 marked PARTIAL with redo instruction
- [ ] poll result timestamped + cadence defined
- [ ] ledger has a v2→v3 section
- [ ] real-run queue head = poll → finish Q3 → Q2 design doc → toolscan B1–B5 → logo follow-ups (auth) → C1/C3 → close-out
- [ ] D-LOG revs, §8 branch semantics, §11 README draft, §7 posted comment untouched

## F. Frozen — what you may NOT change

D-LOG revs (D1 rev 7 …), §8 branch semantics, §11 README draft, §7 posted comment (historical record), §5 hard policy. Any improvement beyond this brief becomes a new D-LOG row — never a silent edit.
