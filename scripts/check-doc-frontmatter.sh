#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

doc_files=()

while IFS= read -r file; do
  doc_files+=("$file")
done < <(
  find design/architecture design/backend design/frontend design/operating-rules \
    -maxdepth 1 -type f -name '*.md' |
    LC_ALL=C sort
)

if [ "${#doc_files[@]}" -eq 0 ]; then
  printf 'No design docs found for frontmatter check.\n'
  exit 0
fi

errors=()

for file in "${doc_files[@]}"; do
  if ! awk '
    BEGIN {
      if (getline first <= 0 || first != "---") {
        print "missing_frontmatter"
        exit
      }

      in_frontmatter = 1
      has_doc_state = 0
      has_owner = 0
      has_last_verified = 0
      has_sources = 0
      saw_end = 0
    }

    NR == 1 { next }

    in_frontmatter && $0 == "---" {
      in_frontmatter = 0
      saw_end = 1
      next
    }

    in_frontmatter {
      if ($0 ~ /^doc_state:[[:space:]]*(current|target)[[:space:]]*$/) has_doc_state = 1
      if ($0 ~ /^owner:[[:space:]]*[^[:space:]].*$/) has_owner = 1
      if ($0 ~ /^last_verified:[[:space:]]*[0-9]{4}-[0-9]{2}-[0-9]{2}[[:space:]]*$/) has_last_verified = 1
      if ($0 ~ /^sources:[[:space:]]*$/) has_sources = 1
    }

    END {
      if (!saw_end) {
        print "missing_frontmatter_end"
        exit
      }
      if (!has_doc_state) print "missing_doc_state"
      if (!has_owner) print "missing_owner"
      if (!has_last_verified) print "missing_last_verified"
      if (!has_sources) print "missing_sources"
    }
  ' "$file"; then
    :
  fi | while IFS= read -r problem; do
    [ -z "$problem" ] && continue
    errors+=("$file: $problem")
  done
done

if [ "${#errors[@]}" -gt 0 ]; then
  printf 'Design doc frontmatter check failed.\n'
  printf 'Expected doc_state, owner, last_verified, and sources frontmatter in design foundation docs.\n'
  printf ' - %s\n' "${errors[@]}"
  exit 1
fi

printf 'Design doc frontmatter check passed for %d file(s).\n' "${#doc_files[@]}"
