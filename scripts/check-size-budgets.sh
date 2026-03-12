#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BUDGET=350
SCORECARD="docs/checklists/harness-scorecard.md"

FILES=(
  "apps/web/src/pages/events/[id]/index.tsx"
  "apps/web/src/pages/crews/[id]/activities/[activityId]/index.tsx"
  "apps/web/src/pages/posts/new/index.tsx"
  "apps/web/src/pages/workouts/new/index.tsx"
  "apps/web/src/pages/challenges/[id]/index.tsx"
  "apps/web/src/pages/settings/profile/index.tsx"
  "apps/web/src/pages/messages/[id]/index.tsx"
  "apps/api/src/crews/crews.service.ts"
)

awk_table_rows() {
  awk '
    /## Readability Budget Registry/ {in_section=1; next}
    /^## / && in_section {exit}
    in_section && /^\|/ {print}
  ' "$SCORECARD"
}

find_registry_row() {
  local target="$1"
  awk_table_rows | awk -F'|' -v target="$target" '
    {
      file=$2
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", file)
      if (file == target) {
        print $0
      }
    }
  '
}

failures=0

for file in "${FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Missing tracked readability target: $file"
    failures=1
    continue
  fi

  line_count="$(wc -l < "$file" | tr -d ' ')"
  row="$(find_registry_row "$file")"

  if (( line_count <= BUDGET )); then
    if [[ -n "$row" ]] && [[ "$row" == *"| exception |"* ]]; then
      echo "Budget met but scorecard still marks exception: $file ($line_count lines)"
      failures=1
    fi
    continue
  fi

  if [[ -z "$row" ]]; then
    echo "Over-budget file without scorecard registry row: $file ($line_count lines)"
    failures=1
    continue
  fi

  if [[ "$row" != *"| exception |"* ]]; then
    echo "Over-budget file without exception state: $file ($line_count lines)"
    failures=1
    continue
  fi

  IFS='|' read -r _ file_col budget_col status_col exception_col owner_col revisit_col task_col _ <<< "$row"
  owner_col="$(echo "$owner_col" | xargs)"
  revisit_col="$(echo "$revisit_col" | xargs)"
  task_col="$(echo "$task_col" | xargs)"

  if [[ -z "$owner_col" || -z "$revisit_col" || -z "$task_col" ]]; then
    echo "Exception row missing owner/revisit/task metadata: $file"
    failures=1
  fi
done

if (( failures > 0 )); then
  exit 1
fi

echo "Readability size budget check passed."
