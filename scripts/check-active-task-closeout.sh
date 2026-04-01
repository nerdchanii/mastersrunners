#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

task_files=()

while IFS= read -r file; do
  task_files+=("$file")
done < <(
  find tasks/active -type f -name '*.md' | LC_ALL=C sort
)

if [ "${#task_files[@]}" -eq 0 ]; then
  printf 'No active task files found.\n'
  exit 0
fi

errors=()

check_file() {
  local file="$1"
  awk '
    function trim(value) {
      sub(/^[[:space:]]+/, "", value)
      sub(/[[:space:]]+$/, "", value)
      return value
    }

    BEGIN {
      frontmatter_done = 0
      in_frontmatter = 0
      malformed_frontmatter = 0
      execution_status = ""
      review_status = ""
      verification_status = ""
      closeout_blocker = ""
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
      if ($0 ~ /^execution_status:/) {
        execution_status = trim(substr($0, index($0, ":") + 1))
      } else if ($0 ~ /^review_status:/) {
        review_status = trim(substr($0, index($0, ":") + 1))
      } else if ($0 ~ /^verification_status:/) {
        verification_status = trim(substr($0, index($0, ":") + 1))
      } else if ($0 ~ /^closeout_blocker:/) {
        closeout_blocker = trim(substr($0, index($0, ":") + 1))
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

      if (execution_status == "") {
        print "missing_execution_status"
      } else if (execution_status !~ /^(in_progress|blocked|ready_for_archive)$/) {
        print "invalid_execution_status:" execution_status
      }

      if (review_status == "") {
        print "missing_review_status"
      } else if (review_status !~ /^(pending|approved)$/) {
        print "invalid_review_status:" review_status
      }

      if (verification_status == "") {
        print "missing_verification_status"
      } else if (verification_status !~ /^(pending|partial|passed)$/) {
        print "invalid_verification_status:" verification_status
      }

      if (execution_status == "blocked" && closeout_blocker == "") {
        print "missing_closeout_blocker"
      }

      if (execution_status == "ready_for_archive") {
        print "ready_for_archive"
      }

      if (execution_status == "in_progress" && review_status == "approved" && verification_status == "passed") {
        print "approved_passed_still_active"
      }
    }
  ' "$file"
}

for file in "${task_files[@]}"; do
  if ! problems_output="$(check_file "$file")"; then
    errors+=("$file: active-task closeout parser failed")
    continue
  fi

  problems=()
  if [ -n "$problems_output" ]; then
    mapfile -t problems <<< "$problems_output"
  fi

  if [ "${#problems[@]}" -eq 0 ]; then
    continue
  fi

  for problem in "${problems[@]}"; do
    case "$problem" in
      missing_frontmatter)
        errors+=("$file: missing or malformed frontmatter")
        ;;
      missing_execution_status)
        errors+=("$file: active tasks must declare execution_status")
        ;;
      missing_review_status)
        errors+=("$file: active tasks must declare review_status")
        ;;
      missing_verification_status)
        errors+=("$file: active tasks must declare verification_status")
        ;;
      missing_closeout_blocker)
        errors+=("$file: blocked active tasks must declare closeout_blocker")
        ;;
      ready_for_archive)
        errors+=("$file: execution_status is ready_for_archive, so move the task to tasks/archive in the same changeset")
        ;;
      approved_passed_still_active)
        errors+=("$file: review_status=approved and verification_status=passed cannot stay execution_status=in_progress")
        ;;
      invalid_execution_status:*)
        errors+=("$file: invalid execution_status '${problem#invalid_execution_status:}'")
        ;;
      invalid_review_status:*)
        errors+=("$file: invalid review_status '${problem#invalid_review_status:}'")
        ;;
      invalid_verification_status:*)
        errors+=("$file: invalid verification_status '${problem#invalid_verification_status:}'")
        ;;
    esac
  done
done

if [ "${#errors[@]}" -gt 0 ]; then
  printf 'Active task closeout check failed.\n'
  printf 'Expected every task under tasks/active/ to expose deterministic closeout state.\n'
  printf ' - %s\n' "${errors[@]}"
  exit 1
fi

printf 'Active task closeout check passed for %d active task file(s).\n' "${#task_files[@]}"
