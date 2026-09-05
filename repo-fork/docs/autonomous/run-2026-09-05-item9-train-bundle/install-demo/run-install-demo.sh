#!/usr/bin/env bash
# run-install-demo.sh — run the REAL ix install-skill.sh hermetically into a
# temp HARNESS_HOME so the whole install process can be watched without touching
# this machine's real harness dirs. Captures a replayable transcript.
set -uo pipefail

D="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="/e/E-github-repos/Ix-remap/.logo-verify"
HOME_ROOT="$D/tmp-home"
LOG="$D/transcript.txt"

rm -rf "$HOME_ROOT"
mkdir -p "$HOME_ROOT/.claude" "$HOME_ROOT/.codex" "$HOME_ROOT/.cursor" "$HOME_ROOT/.agents"
# FULL hermetic override: HOME + USERPROFILE + HARNESS_HOME must ALL point at the
# temp root — HARNESS_HOME alone does NOT redirect install-skill.sh dests (observed
# 2026-09-05: a demo run with only HARNESS_HOME wrote the real ~ harness dirs).
export HOME="$HOME_ROOT"
export USERPROFILE="$HOME_ROOT"
export HARNESS_HOME="$HOME_ROOT"

say() { printf '\n$ %s\n' "$1"; }

{
  echo "Ix installer — live demo (hermetic: HARNESS_HOME=$HOME_ROOT)"
  echo "=============================================================="
  say "bash scripts/install-skill.sh --dry-run --json"
  (cd "$REPO" && bash scripts/install-skill.sh --dry-run --json) || echo "    (exit $?)"
  say "bash scripts/install-skill.sh    # real install, hermetically into HARNESS_HOME"
  (cd "$REPO" && bash scripts/install-skill.sh) || echo "    (exit $?)"
  say "find tmp-home -maxdepth 3 | sort    # what got deployed where"
  (cd "$D" && find tmp-home -maxdepth 3 | sort)
  say "bash scripts/install-skill.sh claude agents   # the corrected README example (valid ids)"
  (cd "$REPO" && bash scripts/install-skill.sh claude agents) || echo "    (exit $?)"
  say "bash scripts/install-skill.sh claude gemini   # the README bug #609 fixes — gemini is not an id"
  (cd "$REPO" && bash scripts/install-skill.sh claude gemini) && echo "    (unexpected success!)" || echo "    (exit $? — error: unknown harness id 'gemini'; docs fix #609)"
} > "$LOG" 2>&1

echo "transcript written: $LOG ($(wc -l < "$LOG") lines)"
