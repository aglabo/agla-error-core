# CLAUDE.md

## コア原則

**プロジェクト**:

`@aglabo/agla-error-core` - @aglabo エコシステムのエラーハンドリングコアモジュール。

**絶対禁止**:

- npm 使用 (pnpm のみ)
- 型エラーを残したコミット
- テストなし機能追加
- 手動コミットメッセージ作成

**必須要件**:

- `pnpm check:types` 常時成功
- `pnpm test:ci` コミット前必須
- Conventional Commits 厳守 (型(スコープ): 説明、72 文字以下)
- AI 自動生成コミットメッセージのみ許可

**AI協働ルール**:

- 判断に迷ったら質問
- スコープは基本 `error-core` (他: config, scripts, deps, tests)
- ファイル名: lowercase-kebab-case、接尾辞 `.class.ts`, `.types.ts`

## 技術スタック

```text
言語: TypeScript 5.9+
ランタイム: Node.js >=20, Deno, Bun (cross-runtime)
パッケージ管理: pnpm@10.24.0
ビルド: tsup (ESM + CJS)
テスト: Vitest, Deno test, Bun test
フォーマット: dprint (手動実行のみ)
リント: ESLint (標準/型付き), ls-lint, textlint, markdownlint
Git: lefthook (pre-commit: gitleaks/secretlint, prepare-commit-msg: AI 生成, commit-msg: commitlint)
```

## プロジェクト構造

```bash
packages/@aglabo/agla-error-core/
├── shared/types/           # AglaError, ErrorSeverity (INFO/WARNING/ERROR/CRITICAL)
├── src/
│   ├── index.ts
│   └── __tests__/
│       ├── unit/           # pnpm test:develop
│       ├── functional/     # pnpm test:functional
│       └── runtime/        # pnpm test:runtime
│           ├── node/       # vitest
│           ├── deno/       # deno test
│           └── bun/        # bun test
├── tests/
│   ├── integration/        # pnpm test:ci (コミット必須)
│   └── e2e/                # pnpm test:e2e
└── configs/                # vitest.config.*.ts, tsup.config.ts, eslint.config.js
```

## 重要コマンド

**セットアップ**:

```bash
pnpm install && lefthook install
```

**開発**:

```bash
pnpm format:dprint         # コード整形 (必須手動実行)
pnpm check:types           # 型チェック
pnpm lint                  # 標準リント
pnpm lint:types            # 型付きリント
```

**テスト**:

```bash
pnpm test:develop          # Unit
pnpm test:ci               # Integration (コミット前必須)
pnpm test:all              # 全テスト並行
pnpm test:runtime          # Cross-runtime (Node.js/Deno/Bun)
```

**カバレッジ**:

```bash
pnpm test:coverage:all     # 全カバレッジ並行取得
pnpm coverage:report       # 全テスト実行 + 分析
```

## テスト戦略

**5層アーキテクチャ**:

1. Unit (`src/__tests__/unit/`) - 個別コンポーネント
2. Functional (`src/__tests__/functional/`) - 機能統合
3. Integration (`tests/integration/`) - モジュール間統合 (必須)
4. E2E (`tests/e2e/`) - 実用シナリオ
5. Runtime (`src/__tests__/runtime/`) - Cross-runtime 互換性

**カバレッジ出力**: `coverage/{unit,functional,integration,e2e,runtime}/`
**キャッシュ**: `.cache/vitest-cache/{test-type}/`

## Git ワークフロー

**Conventional Commits**:

```markdown
type(scope): summary (max 72 chars)

- file1.ext:
  Description (max 100 chars)

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

<!-- textlint-disable ja-technical-writing/sentence-length -->
<!-- textlint-disable ja-technical-writing/max-comma  -->

**型**: feat, fix, chore, docs, test, refactor, perf, ci, config, release, merge, build, style, deps
**スコープ**: error-core, config, scripts, deps, tests

<!-- textlint--enable -->

**Hooks**:

- pre-commit: gitleaks + secretlint (シークレット検出)
- prepare-commit-msg: AI 自動生成 (`scripts/prepare-commit-msg.sh --git-buffer`)
- commit-msg: commitlint 検証

## リソース

**設定**:

- テスト: `packages/@aglabo/agla-error-core/configs/vitest.config.*.ts`
- ビルド: `packages/@aglabo/agla-error-core/configs/tsup.config.ts`
- ESLint: `configs/eslint.config.all.js`, パッケージ内 `configs/eslint.config.js`
- TypeScript: `base/configs/tsconfig.base.json`

**スクリプト**:

- Git hooks: `lefthook.yml`
- コミット生成: `scripts/prepare-commit-msg.sh`
- カバレッジ分析: `scripts/analyze-coverage.js`
- 設定同期: `scripts/sync-configs.sh` (`pnpm sync:configs`)

**パッケージ**: `@aglabo/agla-error-core` v0.1.0, MIT, atsushifx
