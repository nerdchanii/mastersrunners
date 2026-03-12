#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

task_files=()

while IFS= read -r file; do
  task_files+=("$file")
done < <(
  find tasks -type f -name '*.md' \
    \( -path 'tasks/*/todo/*.md' -o -path 'tasks/*/active/*.md' \) |
    LC_ALL=C sort
)

if [ "${#task_files[@]}" -eq 0 ]; then
  printf 'No non-archived task files found.\n'
  exit 0
fi

errors=()

check_file() {
  local file="$1"
  awk '
    BEGIN {
      frontmatter_done = 0
      in_frontmatter = 0
      in_reviewers = 0
      reviewer_count = 0
      po_review_required = 0
      malformed_frontmatter = 0
    }

    NR == 1 {
      if ($0 == "---") {
        in_frontmatter = 1
        next
      }

      print "missing_frontmatter"
      malformed_frontmatter = 1
      exit 0
    }

    in_frontmatter && $0 == "---" {
      in_frontmatter = 0
      frontmatter_done = 1
      next
    }

    in_frontmatter {
      if ($0 ~ /^po_review:[[:space:]]*required[[:space:]]*$/) {
        po_review_required = 1
      }

      if ($0 ~ /^reviewers:[[:space:]]*$/) {
        in_reviewers = 1
        next
      }

      if ($0 ~ /^reviewers:[[:space:]]*\[[[:space:]]*\][[:space:]]*$/) {
        in_reviewers = 0
        next
      }

      if ($0 ~ /^reviewers:[[:space:]]*\[[^]]+\][[:space:]]*$/) {
        reviewer_count = 1
        in_reviewers = 0
        next
      }

      if (in_reviewers) {
        if ($0 ~ /^[[:space:]]*-[[:space:]]+[^[:space:]].*$/) {
          reviewer_count++
          next
        }

        if ($0 ~ /^[A-Za-z0-9_]+:/) {
          in_reviewers = 0
        }
      }
    }

    END {
      if (malformed_frontmatter) {
        exit 0
      }

      if (!frontmatter_done) {
        print "missing_frontmatter"
        exit
      }

      if (reviewer_count < 1) {
        print "missing_reviewers"
      }

      if (!po_review_required) {
        print "missing_po_review"
      }
    }
  ' "$file"
}

for file in "${task_files[@]}"; do
  mapfile -t problems < <(check_file "$file")

  if [ "${#problems[@]}" -eq 0 ]; then
    continue
  fi

  for problem in "${problems[@]}"; do
    case "$problem" in
      missing_frontmatter)
        errors+=("$file: missing or malformed frontmatter")
        ;;
      missing_reviewers)
        errors+=("$file: reviewers must be present and non-empty")
        ;;
      missing_po_review)
        errors+=("$file: po_review must be set to required")
        ;;
    esac
  done
done

if [ "${#errors[@]}" -gt 0 ]; then
  printf 'Task review metadata check failed.\n'
  printf 'Expected every task under tasks/*/{todo,active}/ to declare a non-empty reviewers list and po_review: required.\n'
  printf ' - %s\n' "${errors[@]}"
  exit 1
fi

printf 'Task review metadata check passed for %d non-archived task file(s).\n' "${#task_files[@]}"
