# run-2026-09-05-item8-kb-closeout — state

- Created: 2026-09-05
- Task: v7 dispatch queue item 8 — close-out KB extraction with provenance
- Status: DONE — 8 rows added + verify-gate PASS + promoted TRUSTED in
  E:/E-github-repos/agent-knowledge-base (data/knowledge.db, kb.mjs)
- Rows (title → id / evidence):
  - 6638 tool-quirk VERIFIED — GraphQL-only open→draft conversion (#604)
  - 6639 CI-pattern VERIFIED — Windows-green/Linux-red hermeticity class +
    declared-platform path module (toolscan e47f42b/2f88671b, #604 0869a137)
  - 6640 root-cause VERIFIED — v8 coverage ~10x hot-loop slowdown → budget fix (#604)
  - 6641 root-cause OBSERVED — CodeQL "file may have changed" ref-moved SARIF race signature (#604)
  - 6642 tool-quirk OBSERVED — pulls/{n} 404 probe-artifact discipline (#37)
  - 6643 guideline OBSERVED — KEEP-by-merge governance (#591)
  - 6644 workflow-optimization OBSERVED — dispatch self-refresh / stale-plan lesson
  - 6645 CI-pattern OBSERVED — committed-bundle dist-sync content-compare gate (toolscan)
- Superseded-not-stacked: installer doc-vs-registry drift class already owned by
  #6227/#6226 (flag-registry family); A/B tree-proof already owned by #6575/#6578;
  parity-trio + sweep summary are campaign bookkeeping (dispatch §0 + run-dirs), not
  durable KB rows. Not re-added.
- Zero upstream writes this session.
