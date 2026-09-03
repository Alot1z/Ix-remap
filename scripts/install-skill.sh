#!/usr/bin/env bash
#
# Install the Ix skill for every agent harness found on this machine.
#
# skills/ix is a single, harness-agnostic skill (SKILL.md + references/ +
# scripts/). Each agent harness loads skills from its own directory, so this
# script probes for installed harnesses and deploys the same tree to each one
# that is present:
#
#   ~/.claude/skills/ix            Claude Code
#   ~/.agents/skills/ix            Freebuff / Codebuff
#   ~/.codex/skills/ix             Codex CLI
#   ~/.gemini/skills/ix            Gemini CLI
#   ~/.cursor/skills/ix            Cursor
#   ~/.config/opencode/skills/ix   opencode
#   ~/.vscode/skills/ix            VS Code
#   ~/.openclaw/skills/ix          OpenClaw
#
# A harness is "present" when its CLI is on PATH or its config directory
# exists — the same detection `ix mcp install` uses — so a GUI-only install is
# still found. Re-run after editing skills/ix to update every installed copy.
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

# id|bin|config dir|skill destination
HARNESSES=(
  "claude|claude|$HOME/.claude|$HOME/.claude/skills/ix"
  "agents||$HOME/.agents|$HOME/.agents/skills/ix"
  "codex|codex|$HOME/.codex|$HOME/.codex/skills/ix"
  "gemini|gemini|$HOME/.gemini|$HOME/.gemini/skills/ix"
  "cursor|cursor|$HOME/.cursor|$HOME/.cursor/skills/ix"
  "opencode|opencode|$HOME/.config/opencode|$HOME/.config/opencode/skills/ix"
  "vscode|code|$HOME/.vscode|$HOME/.vscode/skills/ix"
  "openclaw|openclaw|$HOME/.openclaw|$HOME/.openclaw/skills/ix"
)

detected() {
  local bin="$1" cfg="$2"
  { [ -n "$bin" ] && command -v "$bin" >/dev/null 2>&1; } || [ -e "$cfg" ]
}

if [ "${#EXPLICIT[@]}" -gt 0 ]; then
  wanted="${EXPLICIT[*]}"
  filtered=()
  for entry in "${HARNESSES[@]}"; do
    id="${entry%%|*}"
    case " $wanted " in
      *" $id "*) filtered+=("$entry") ;;
    esac
  done
  HARNESSES=("${filtered[@]}")
fi

installed=0
skipped=0
conflicts=0
for entry in "${HARNESSES[@]}"; do
  IFS='|' read -r id bin cfg dest <<<"$entry"
  if ! detected "$bin" "$cfg"; then
    if [ -n "$bin" ]; then
      echo "skip: $id — no $bin CLI or config at $cfg"
    else
      echo "skip: $id — no config at $cfg"
    fi
    skipped=$((skipped + 1))
    continue
  fi
  if [ "$DRY_RUN" = "1" ]; then
    echo "would install: $dest"
    installed=$((installed + 1))
    continue
  fi
  mkdir -p "$(dirname "$dest")"
  if [ -e "$dest" ]; then
    # Refuse to delete something that is not a previous install of this skill.
    # `ix` is a short name, and the unconditional `rm -rf` this replaces would
    # silently destroy a hand-written skill that happened to share it — with no
    # prompt, no backup, and nothing in the output to say it had happened.
    if [ "$FORCE" != "1" ] && ! grep -qs '^name: ix$' "$dest/SKILL.md"; then
      echo "error: $dest exists and is not an Ix skill install." >&2
      echo "       Move it aside, or re-run with --force to overwrite it." >&2
      conflicts=$((conflicts + 1))
      continue
    fi
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
  echo "No agent harness found. Install one of: claude, agents (Freebuff),"
  echo "codex, gemini, cursor, opencode, vscode, openclaw — or pass ids:"
  echo "  bash scripts/install-skill.sh claude"
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