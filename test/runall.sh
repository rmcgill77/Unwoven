#!/usr/bin/env bash
# Story, UI and battle regression suite. Run from the repo root after `npm run build`.
set -u
for t in ui_test day2 story story2 wolf battle2 creator tome; do
  echo "=== $t"
  timeout 300 python3 -u test/$t.py 2>&1 | grep -v "fonts.google\|ERR_TUNNEL\|^$" | tail -12
done
echo ALLDONE
