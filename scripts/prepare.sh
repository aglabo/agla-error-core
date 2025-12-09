#!/usr/bin/env bash
## src: ./scripts/prepare.sh
# @(#) : Install lefthook in local development environment only
#
# Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#

# CI環境かどうかを判定する関数
is_ci_environment() {
  # 一般的なCI環境変数をチェック
  [ -n "$CI" ] ||           # 汎用CI環境変数
  [ -n "$GITHUB_ACTIONS" ] || # GitHub Actions
  [ -n "$GITLAB_CI" ] ||      # GitLab CI
  [ -n "$CIRCLECI" ] ||       # CircleCI
  [ -n "$JENKINS_HOME" ] ||   # Jenkins
  [ -n "$TRAVIS" ]            # Travis CI
}

# メイン処理
main() {
  if is_ci_environment; then
    echo "CI environment detected. Skipping lefthook install."
    exit 0
  fi

  echo "Local development environment detected. Installing lefthook..."
  lefthook install
}

main
