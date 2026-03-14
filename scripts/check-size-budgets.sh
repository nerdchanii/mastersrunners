#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REGISTRY="scripts/check-size-budgets.targets.json"

BUDGET="$(node -e "const fs = require('fs'); const data = JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); if (!Number.isInteger(data.budget)) { throw new Error('Invalid readability budget registry: missing integer budget'); } console.log(data.budget);" "$REGISTRY")"

mapfile -t REGISTRY_ROWS < <(
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
    if (!Array.isArray(data.targets)) {
      throw new Error('Invalid readability budget registry: missing targets array');
    }

    for (const target of data.targets) {
      const row = [
        target.path ?? '',
        target.status ?? '',
        target.exception_id ?? '',
        target.owner ?? '',
        target.revisit_date ?? '',
        target.task_id ?? '',
      ];
      console.log(row.join('\t'));
    }
  " "$REGISTRY"
)

failures=0

for row in "${REGISTRY_ROWS[@]}"; do
  IFS=$'\t' read -r file status exception_id owner revisit_date task_id <<< "$row"

  if [[ ! -f "$file" ]]; then
    echo "Missing tracked readability target: $file"
    failures=1
    continue
  fi

  line_count="$(wc -l < "$file" | tr -d ' ')"

  if (( line_count <= BUDGET )); then
    if [[ "$status" == "exception" ]]; then
      echo "Budget met but registry still marks exception: $file ($line_count lines)"
      failures=1
    fi
    continue
  fi

  if [[ "$status" != "exception" ]]; then
    echo "Over-budget file without exception state: $file ($line_count lines)"
    failures=1
    continue
  fi

  if [[ -z "$owner" || -z "$revisit_date" || -z "$task_id" || -z "$exception_id" ]]; then
    echo "Exception row missing owner/revisit/task metadata: $file"
    failures=1
  fi
done

if (( failures > 0 )); then
  exit 1
fi

echo "Readability size budget check passed."
