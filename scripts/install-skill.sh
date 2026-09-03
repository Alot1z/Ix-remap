#!/usr/bin/env bash
#
# Install the Ix skill for every agent harness found on this machine.
#
# skills/ix is a single, harness-agnostic skill (SKILL.md + references/ +
# scripts/). Each agent harness loads skills from its own directory, so this
# script probes for installed harnesses and deploys the same tree to each one
# that is present.
#
# The harness table is NOT maintained here: it is derived from the
# authoritative registry, ix-cli/src/mcp/hosts.ts (the same host list `ix mcp
# install` drives), read by ix-cli/scripts/skill-harnesses.mjs. A harness
# added to hosts.ts with a literal config target becomes installable here with
# zero edits to this script. ~/.agents — the agents.md surface — is not an MCP
# host, so the helper appends it as a documented supplement.
#
# A harness is "present" when its CLI is on PATH or its config directory
# exists, so a GUI-only install is still found. Re-run after editing skills/ix
# to update every installed copy.
#
# Usage:
#   bash scripts/install-skill.sh            # install to every harness found
#   bash scripts/install-skill.sh --dry-run  # show the targets, write nothing
#   bash scripts/install-skill.sh --force    # overwrite a same-name foreign skill
#   bash scripts/install-skill.sh claude codex  # explicit harness ids only

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/skills/ix"
[ -f "$SRC/SKILL.md" ] || { echo "error: $SRC/SKILL.md not found" >&2; exit 1; }

FORCE=0
DRY_RUN=0
EXPLICIT=()
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --dry-run) DRY_RUN=1 ;;
    -*) echo "error: unknown option $arg" >&2; exit 1 ;;
    *) EXPLICIT+=("$arg") ;;
  esac
done

# --- Read the harness registry (hosts.ts via the helper, no built CLI) ------
HELPER="$ROOT/ix-cli/scripts/skill-harnesses.mjs"
if [ ! -f "$HELPER" ]; then
  echo "error: $HELPER not found (the harness registry helper)" >&2
  exit 1
fi
if ! command -v node >/dev/null 2>&1; then
  echo "error: node is required to read the harness registry (ix-cli/src/mcp/hosts.ts)" >&2
  exit 1
fi

HELPER_OUT="$(node "$HELPER")" || {
  echo "error: harness registry helper failed — see its stderr above" >&2
  exit 1
}
IDS=() LABELS=() BINS=() CFGS=() DESTS=()
while IFS= read -r row; do
  IFS='|' read -r id label bin cfg skill <<<"$row"
  [ -z "$cfg" ] && { echo "error: harness '$id' has no config-dir convention" >&2; exit 1; }
  cfg="${cfg//\~/$HOME}"
  skill="${skill//\~/$HOME}"
  IDS+=("$id"); LABELS+=("$label"); BINS+=("$bin"); CFGS+=("$cfg"); DESTS+=("$skill/ix")
done <<<"$HELPER_OUT"

if [ "${#IDS[@]}" = "0" ]; then
  echo "error: harness registry produced no entries" >&2
  exit 1
fi

# --- Explicit harness id selection (unknown ids are an error, not a no-op) ---
if [ "${#EXPLICIT[@]}" -gt 0 ]; then
  all="${IDS[*]}"
  for id in "${EXPLICIT[@]}"; do
    case " $all " in
      *" $id "*) ;;
      *) echo "error: unknown harness id '$id'" >&2
         echo "       valid ids:${all}" >&2
         exit 1 ;;
    esac
  done
  want=" ${EXPLICIT[*]} "
  o_ids=("${IDS[@]}"); o_labels=("${LABELS[@]}"); o_bins=("${BINS[@]}")
  o_cfgs=("${CFGS[@]}"); o_dests=("${DESTS[@]}")
  IDS=(); LABELS=(); BINS=(); CFGS=(); DESTS=()
  for ((i = 0; i < ${#o_ids[@]}; i++)); do
    case "$want" in
      *" ${o_ids[$i]} "*)
        IDS+=("${o_ids[$i]}"); LABELS+=("${o_labels[$i]}"); BINS+=("${o_bins[$i]}")
        CFGS+=("${o_cfgs[$i]}"); DESTS+=("${o_dests[$i]}") ;;
    esac
  done
fi

# --- Install to every selected harness that is present -----------------------
installed=0
conflicts=0
for ((i = 0; i < ${#IDS[@]}; i++)); do
  id="${IDS[$i]}"; bin="${BINS[$i]}"; cfg="${CFGS[$i]}"; dest="${DESTS[$i]}"
  if ! { [ -n "$bin" ] && command -v "$bin" >/dev/null 2>&1; } && [ ! -e "$cfg" ]; then
    if [ -n "$bin" ]; then
      echo "skip: $id — no $bin CLI or config at $cfg"
    else
      echo "skip: $id — no config at $cfg"
    fi
    continue
  fi
  if [ -e "$dest" ] && [ "$FORCE" != "1" ] && ! grep -qs '^name: ix$' "$dest/SKILL.md"; then
    # Refuse to delete something that is not a previous install of this skill.
    # `ix` is a short name, and the unconditional `rm -rf` this replaces would
    # silently destroy a hand-written skill that happened to share it — with no
    # prompt, no backup, and nothing in the output to say it had happened. The
    # check runs in dry-run too, so the preview and the real run agree.
    if [ "$DRY_RUN" = "1" ]; then
      echo "would refuse: $dest — exists and is not an Ix skill install (use --force)"
    else
      echo "error: $dest exists and is not an Ix skill install." >&2
      echo "       Move it aside, or re-run with --force to overwrite it." >&2
    fi
    conflicts=$((conflicts + 1))
    continue
  fi
  if [ "$DRY_RUN" = "1" ]; then
    echo "would install: $dest"
    installed=$((installed + 1))
    continue
  fi
  mkdir -p "$(dirname "$dest")"
  if [ -e "$dest" ]; then
    rm -rf "$dest"
  fi
  cp -R "$SRC" "$dest"
  echo "Installed: $dest"
  installed=$((installed + 1))
done

if [ "$DRY_RUN" = "1" ]; then
  echo
  echo "Dry run: $installed harness(es) would receive the skill."
  exit 0
fi

if [ "$installed" = "0" ] && [ "$conflicts" = "0" ]; then
  echo
  echo "No agent harness found. Install one of: ${IDS[*]} — or pass ids:"
  echo "  bash scripts/install-skill.sh ${IDS[0]}"
  exit 0
fi

echo
if [ "$conflicts" = "0" ]; then
  echo "Ix skill installed for $installed harness(es)."
else
  echo "Ix skill installed for $installed harness(es); $conflicts destination(s) refused."
fi
echo "Start a new session so the agent picks it up, then ask it to use Ix:"
echo "  \"Set up Ix and map this repo\""

[ "$conflicts" = "0" ] || exit 1