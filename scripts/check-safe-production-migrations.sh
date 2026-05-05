#!/usr/bin/env bash

set -euo pipefail
shopt -s nocasematch

base_ref="${1:-}"
head_ref="${2:-HEAD}"

if [[ -n "$base_ref" ]] && git rev-parse --verify "${base_ref}^{commit}" >/dev/null 2>&1; then
  diff_base="$base_ref"
else
  diff_base="${head_ref}^"
fi

mapfile -t migration_files < <(
  git diff --name-only "$diff_base" "$head_ref" -- "packages/database/prisma/migrations" \
    | grep 'migration.sql$' || true
)

trim() {
  local value="$1"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

normalize_statements() {
  local file="$1"

  perl -0pe 's{/\*.*?\*/}{}gs; s/--[^\n]*//g' "$file" \
    | awk '
        BEGIN { RS=";"; ORS="" }
        {
          gsub(/[[:space:]]+/, " ");
          sub(/^ /, "");
          sub(/ $/, "");
          if (length($0) > 0) {
            print $0 "\n";
          }
        }
      '
}

is_safe_alter_operation() {
  local operation

  operation="$(trim "$1")"

  [[ -z "$operation" ]] && return 0
  if [[ "$operation" =~ ^ADD[[:space:]]+COLUMN[[:space:]] ]]; then
    if [[ "$operation" =~ [[:space:]](UNIQUE|PRIMARY[[:space:]]+KEY|REFERENCES|CHECK)[[:space:]] ]]; then
      return 1
    fi
    if [[ "$operation" =~ [[:space:]]NOT[[:space:]]+NULL ]] && ! [[ "$operation" =~ [[:space:]]DEFAULT[[:space:]] ]]; then
      return 1
    fi
    return 0
  fi
  [[ "$operation" =~ ^ALTER[[:space:]]+COLUMN[[:space:]]+[^[:space:]]+[[:space:]]+DROP[[:space:]]+DEFAULT$ ]] && return 0
  [[ "$operation" =~ ^ALTER[[:space:]]+COLUMN[[:space:]]+[^[:space:]]+[[:space:]]+DROP[[:space:]]+NOT[[:space:]]+NULL$ ]] && return 0
  [[ "$operation" =~ ^ALTER[[:space:]]+COLUMN[[:space:]]+[^[:space:]]+[[:space:]]+SET[[:space:]]+DEFAULT[[:space:]].+$ ]] && return 0

  return 1
}

is_safe_statement() {
  local statement="$1"
  local operations raw_operation

  [[ "$statement" =~ ^CREATE[[:space:]]+TABLE[[:space:]] ]] && return 0
  [[ "$statement" =~ ^CREATE[[:space:]]+INDEX[[:space:]] ]] && return 0
  [[ "$statement" =~ ^CREATE[[:space:]]+EXTENSION[[:space:]] ]] && return 0

  if [[ "$statement" =~ ^ALTER[[:space:]]+TABLE[[:space:]]+[^[:space:]]+[[:space:]]+(.+)$ ]]; then
    operations="${BASH_REMATCH[1]}"
    IFS=',' read -r -a raw_operations <<< "$operations"
    for raw_operation in "${raw_operations[@]}"; do
      if ! is_safe_alter_operation "$raw_operation"; then
        return 1
      fi
    done
    return 0
  fi

  return 1
}

if [[ ${#migration_files[@]} -eq 0 ]]; then
  echo "No migration SQL changes detected in the deploy range."
  exit 0
fi

found_unsafe=0
statement=''

for file in "${migration_files[@]}"; do
  while IFS= read -r statement; do
    if ! is_safe_statement "$statement"; then
      echo "::error file=$file::Automated main-branch deploys only support an additive SQL subset. Unsupported statement: $statement"
      found_unsafe=1
    fi
  done < <(normalize_statements "$file")
done

if [[ "$found_unsafe" -eq 1 ]]; then
  exit 1
fi

echo "Migration SQL in the deploy range stays within the additive-only automated rollout subset."
