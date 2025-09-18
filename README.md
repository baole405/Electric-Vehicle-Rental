# Electric-Vehicle-Rental

This repository is an Nx monorepo containing the Electric Vehicle Rental application (`apps/ev-rental`). Below is a curated subset of the Nx generated guidance for day‑to‑day usage.

## Development

Run dev server:
```sh
npx nx serve ev-rental
```

Build production bundle:
```sh
npx nx build ev-rental
```

Show targets for the app:
```sh
npx nx show project ev-rental
```

## Tooling

Commit messages are linted with Commitlint (Conventional Commits) via a Husky `commit-msg` hook.

Format & lint:
```sh
npx nx lint ev-rental
```

You can explore the project graph:
```sh
npx nx graph
```

## Adding New Projects

Use Nx generators, for example:
```sh
npx nx g @nx/react:app demo
```

## Community & Docs

Full Nx documentation: https://nx.dev
