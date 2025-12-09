# 🤝 コントリビューションガイドライン

<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->

このプロジェクトへの貢献をご検討いただき、ありがとうございます！
皆さまのアイデアが、このプロジェクトをさらによくする手助けとなることを願っています。

## 📝 貢献の方法

### 1. Issue の報告

- バグ報告や機能提案は、[Issues](https://github.com/aglabo/agla-error-core/issues) にてお願いいたします。
- 報告の際は、再現手順や期待される動作、実際の動作など、十分な詳細情報を提供してください。

### 2. プルリクエストの提出

- リポジトリをフォークし、`feature/your-feature-name` のようなブランチを作成してください。
- 変更を加えて、明確なコミットメッセージでコミットしてください。
  - [Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) に従ってください。
  - 可能であれば変更ごとに１つのコミットを作成し、あとで rebase してコミット履歴をきれいにしてください。
- プルリクエストには、明確なタイトルと説明を記載してください。

## 🔧 プロジェクト環境

### セットアップ

```bash
git clone https://github.com/aglabo/agla-error-core.git
cd agla-error-core
pnpm install
```

### テスト

このプロジェクトは、複数のテストを採用しています。

- Unit tests (Vitest)
- Functional tests
- Integration tests
- E2E tests
- Runtime tests (Node / Deno / Bun)

すべてのテストを実行:

```bash
pnpm test:all
```

### Lint & Format

プルリクエストを提出する前に、静的チェックを実行:

```bash
pnpm check:types
pnpm lint
pnpm lint:secrets
pnpm format:dprint
```

使用しているツール:

- Formatter: dprint
- Linters: eslint, textlint, markdownlint
- Spell checker: cspell
- Secret scan: secretlint

## 📜 行動規範

すべてのコントリビューターは、[行動規範](https://github.com/aglabo/.github/blob/main/.github/CODE_of_CONDUCT.ja.md) を遵守してください。

## 📚 参考

- [GitHub Docs: リポジトリコントリビューターのためのガイドラインを定める](https://docs.github.com/ja/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors)

---

## 📬 Issue / Pull Request の作成

<!-- textlint-disable @textlint-ja/ai-writing/no-ai-list-formatting -->

- [🐛 バグ報告を作成する](https://github.com/aglabo/agla-error-core/issues/new?template=bug_report.yml)
- [✨ 機能提案を作成する](https://github.com/aglabo/agla-error-core/issues/new?template=feature_request.yml)
- [💬 自由トピックを投稿する](https://github.com/aglabo/agla-error-core/issues/new?template=open_topic.yml)
- [🔀 Pull Request を作成する](https://github.com/aglabo/agla-error-core/compare)

<!-- textlint-enable -->
