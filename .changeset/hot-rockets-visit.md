---
"@aglabo/agla-error-core": patch
---

Release v0.1.1: Add documentation and CI/CD workflows

**CI/CD Workflows:**

- Add changesets-version-pr.yml for automated version PR creation
- Add publish-package.yml for automated package publishing

**Documentation:**

- Add LICENSE and LICENSE.ja to package
- Add comprehensive README.md and README.ja.md with usage examples

**Build Process:**

- Unify tsup execution via pnpm exec
- Add sync-configs.sh script for configuration synchronization
- Update base-scripts.json with new sync:configs command

**Package Metadata:**

- Update package.json with repository, homepage, and bugs information
