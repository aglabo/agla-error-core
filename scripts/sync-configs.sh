#!/usr/bin/env bash
## src: ./scripts/sync-configs.sh
# @(#) : Sync shared config files into target directory (by type)
#
# Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# Description <<
#   Sync shared config files to sub repository root.
#   Uses $INIT_CWD (pnpm invocation directory) as target.
#
# Usage:
#   ./scripts/sync-configs.sh [--dry-run]
#
#<<

set -euCo pipefail

##  Constants
readonly REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../" && pwd)"
readonly CONFIG_DIR="${REPO_ROOT}/shared/configs"
readonly SCRIPT_SYNC="${REPO_ROOT}/scripts/sync-package-scripts.ts"

## Global Flags
FLAG_DRY_RUN=false

##  Functions

# sync files matching pattern from repo root
sync_files() {
  local target_dir="$1"
  local file_pattern="$2"
  local label="$3"

  echo "$label"

  for file in $file_pattern; do
    if [[ -f "$file" ]]; then
      local basename="$(basename "$file")"
      if $FLAG_DRY_RUN; then
        echo "  [DRY-RUN] Would copy: $basename"
      else
        cp "$file" "$target_dir/$basename"
        echo "  ✓ Copied: $basename"
      fi
    fi
  done
}

# sync README.* files from repo root
sync_readme() {
  sync_files "$1" "$REPO_ROOT/README.*" "📄 [README.*]"
}

# sync LICENSE* files from repo root
sync_license() {
  sync_files "$1" "$REPO_ROOT/LICENSE*" "📜 [LICENSE*]"
}

# sync all config files
sync_all_configs() {
  local target_dir="$1"

  echo "🔧 [package.json:scripts]"
  DRY_RUN=""
  $FLAG_DRY_RUN && DRY_RUN="--dry-run"
  pnpm exec tsx "$SCRIPT_SYNC" "$target_dir" "$REPO_ROOT" "$DRY_RUN"
}

## functions from options

# show usage from the top of this script
print_usage() {
  sed -n 's/^# \{0,1\}//p; /^<<$/q' "$0"
}

## Main Routine
main() {
  local target_dir="$1"
  local first_arg="${2:-}"

  # 💡 --help/-h のとき usage を出力して終了
  if [[ "$first_arg" == "--help" || "$first_arg" == "-h" ]]; then
 	  print_usage
    exit 0
  fi

  if [[ "$first_arg" == "--dry-run" ]]; then
    FLAG_DRY_RUN=true
  fi

  if [[ ! -d "$target_dir" ]]; then
    echo "❌ Target directory does not exist: $target_dir"
    exit 1
  fi

  echo "📦 Syncing configs ${CONFIG_DIR} to: $target_dir"
  $FLAG_DRY_RUN && echo "🚫 Dry run mode is active. No files will be written."

  sync_readme "$target_dir" || exit 1
  sync_license "$target_dir" || exit 1
  sync_all_configs "$target_dir" || exit 1

  echo "🎉 Sync complete!"
}

# Always use INIT_CWD as target directory
main "${INIT_CWD:-.}" "$@"
