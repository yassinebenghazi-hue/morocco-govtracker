#!/usr/bin/env bash
# Publish laptop changes to GitHub. GitHub Pages then rebuilds the live site (~2 min).
#   bash projects/govtracker/publish.sh "What changed"
#   bash projects/govtracker/publish.sh --pull        # only bring down edits made on github.com
#
# Git data lives OUTSIDE OneDrive in ~/.git-govtracker (no .git inside this folder, so the
# Demo Assistant backup keeps tracking these files as normal files).
set -euo pipefail

GD="$HOME/.git-govtracker"
SITE="https://yassinebenghazi-hue.github.io/morocco-govtracker/"
g() { git --git-dir="$GD" "$@"; }
cd "$(dirname "$0")"

[ -d "$GD" ] || { echo "No repo at $GD - see README.md > Publishing."; exit 1; }

if [ "${1:-}" = "--pull" ]; then
  g pull -q --ff-only origin main && echo "Laptop is up to date with GitHub: $(g log -1 --oneline)"
  exit 0
fi

MSG="${1:-Update GovTracker}"

# Same tests the deploy runs: a broken kpis.json never leaves the laptop.
node --test src/lib/progress.test.js >/dev/null 2>&1 || {
  echo "Tests FAILED - nothing published. Run: node --test src/lib/progress.test.js"; exit 1; }

g add -A
if g diff --cached --quiet; then
  echo "No local changes."
else
  g commit -q -m "$MSG"
fi

# Bring in anything edited on github.com first (e.g. a kpis.json update), then push.
if ! g pull -q --rebase origin main; then
  g rebase --abort 2>/dev/null || true
  echo "CONFLICT: the same lines were changed on github.com and on the laptop. Nothing pushed."
  exit 1
fi

if [ -z "$(g log origin/main..HEAD --oneline)" ]; then
  echo "Nothing to push - GitHub already matches the laptop."
  exit 0
fi

g push -q origin main
echo "Pushed: $(g log -1 --oneline)"
echo "Live in ~2 min: $SITE"
