# Electric Vehicle Rental – Agent Workflow Guide

## Branching and Pull Requests
- GitHub Actions validates pull request branches follow either `type/name` or `codex/type/name`. Allowed `type` values are `feature`, `feat`, `bugfix`, `fix`, `hotfix`, `chore`, `refactor`, `release`, `docs`, and `test`.
- Open pull requests against the `dev` branch unless explicitly instructed otherwise.

## Local Development
- Install dependencies with `npm ci` before running Nx commands.
- For changes that touch application or library source code, run the following commands:
  - `npx nx affected:lint --base=origin/dev --head=HEAD`
  - `npx nx affected:test --base=origin/dev --head=HEAD`
  - `npx nx affected:build --base=origin/dev --head=HEAD`
- When only documentation, configuration, or GitHub workflow files are modified, the Nx commands above are optional.

## Additional Notes
- Nx Cloud integration is disabled; tasks run locally by default.
- Prefer keeping CI scripts and workflow steps aligned with the `ci.yml` workflow in `.github/workflows/`.
