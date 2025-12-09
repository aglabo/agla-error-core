# 🤝 Contribution Guidelines
<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->

Thank you for thinking about contributing to this project!
We hope your ideas will help make this project even better.

## 📝 How to contribute

### 1. Report an Issue

- Please use [Issues](https://github.com/aglabo/agla-error-core/issues) to report bugs or suggest features.
- Add enough details (steps, expected behavior, actual behavior).

### 2. Submit a Pull Request

- Fork the repository and create a new branch like `feature/your-feature-name`.
- Make your changes and commit them clearly.
  - Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
  - Make one commit per change if possible, and rebase later to clean history.
- Write a clear title and description for your pull request.

## 🔧 Project environment

### Setup

```bash
git clone https://github.com/aglabo/agla-error-core.git
cd agla-error-core
pnpm install
```

### Testing

This project uses a multi-layer test structure:

- Unit tests (Vitest)
- Functional tests
- Integration tests
- E2E tests
- Runtime tests (Node / Deno / Bun)

Run everything:

```bash
pnpm test:all
```

### Lint & Format

Run the static checks before submitting a PR:

```bash
pnpm check:types
pnpm lint
pnpm lint:secrets
pnpm format:dprint
```

Tools used:

- Formatter: dprint
- Linters: eslint, textlint, markdownlint
- Spell checker: cspell
- Secret scan: secretlint

## 📜 Code of Conduct

All contributors must follow our [Code of Conduct](https://github.com/aglabo/.github/blob/main/.github/CODE_of_CONDUCT.md)

## 📚 References

- [GitHub Docs: Setting guidelines for repository contributors](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors)

---

## 📬 Create an Issue or PR

<!-- textlint-disable @textlint-ja/ai-writing/no-ai-list-formatting -->

- [🐛 Report a Bug](https://github.com/aglabo/agla-error-core/issues/new?template=bug_report.yml)
- [✨ Request a Feature](https://github.com/aglabo/agla-error-core/issues/new?template=feature_request.yml)
- [💬 Open a Topic](https://github.com/aglabo/agla-error-core/issues/new?template=open_topic.yml)
- [🔀 Create a Pull Request](https://github.com/aglabo/agla-error-core/compare)

<!-- textlint-enable -->
