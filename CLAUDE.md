# CLAUDE.md

**agla-error-core** は TypeScript 製のエラーハンドリングライブラリ。pnpm workspace による monorepo で、複数ランタイム (Node.js, Deno, Bun) 対応。

## コア原則

- pnpm 専用: npm は使わない。`pnpm install`, `pnpm run` のみ
- 自動コミットメッセージ生成: `git commit` で自動生成。手書き禁止。`--model claude-sonnet-4-5` で claude 指定可
- Conventional Commits 厳密準守: 型(スコープ): 説明。ヘッダ 72 字以下、本文 100 字以下
- 型安全性最優先: `pnpm run check:types` で常に型チェック。型エラーは即修正
- テストと品質: `pnpm run test:ci` 通さないコミット禁止。全テストタイプ (unit/functional/integration/e2e/runtime) 通すこと

## 技術スタック

| 項目           | 詳細                                                  |
| -------------- | ----------------------------------------------------- |
| 言語           | TypeScript 5.9+                                       |
| ランタイム     | Node.js >=20, Deno, Bun                               |
| パッケージ管理 | pnpm@10.24.0                                          |
| ビルド         | tsup (ESM + CJS)                                      |
| テスト         | Vitest (5 種類の config)                              |
| 格式化         | dprint                                                |
| リント         | ESLint + ls-lint + textlint + markdownlint            |
| Git フック     | lefthook (pre-commit, prepare-commit-msg, commit-msg) |

## クイックコマンド

```bash
# セットアップ
pnpm install
lefthook install

# 開発
pnpm run lint              # 全リント実行
pnpm run format:dprint     # コード整形
pnpm run check:types       # 型チェック
pnpm run test:develop      # テスト (ウォッチモード)
pnpm run test:ci           # CI テストスイート
pnpm run sync:configs      # 設定同期
```

## ディレクトリ構成

```bash
packages/@aglabo/agla-error-core/
├── shared/types/           # AglaError, ErrorSeverity など
├── src/
│   ├── index.ts           # エントリーポイント
│   └── __tests__/         # unit, functional, runtime テスト
├── tests/                 # integration, e2e テスト
└── configs/               # tsup, vitest, eslint 設定
```

## AI 協働ガイド

### 禁止事項

- npm を使う
- 型エラーを無視してコミット
- テスト抜きで機能追加
- 手動でコミットメッセージ作成

### 判断に迷う場合

- スコープ不明：`error-core` 使用が基本 (config, scripts, deps など個別指定も可)
- テスト場所：機能は `src/__tests__/`、統合は `tests/`
- ファイル名：lowercase-kebab-case (ts ファイルは `.class.ts`, `.types.ts` 接尾辞使用)

### ツール制限

- commitlint は自動コミット中に実行される (手動 commit-msg 作成不可)
- dprint は自動フォーマット非対応 (明示的な `pnpm run format:dprint` が必要)
- lefthook は pre-commit で secret 検出 (gitleaks, secretlint)

## リソース

- テスト戦略: `packages/@aglabo/agla-error-core/configs/vitest.config.*.ts`
- ビルド設定: `packages/@aglabo/agla-error-core/configs/tsup.config.ts`
- Git フック: `lefthook.yml`, `scripts/prepare-commit-msg.sh`
- コミットルール: `configs/commitlint.config.js`
