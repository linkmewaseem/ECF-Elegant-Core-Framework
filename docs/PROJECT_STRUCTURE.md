# Project Structure

ECF is a pnpm workspace monorepo. It separates reusable framework packages, runnable applications, and examples so consumers do not need to install the whole repository.

```
ecf/
├── packages/     Publishable `@ecfjs/*` framework modules
├── apps/         Internal demonstration applications
├── examples/     Small, focused usage examples
├── docs/         Framework, governance, and release documentation
├── .github/      CI, CodeQL, issue templates, and dependency updates
├── tools/        Internal workspace tooling
├── package.json  Root scripts and workspace metadata
└── pnpm-workspace.yaml
```

## Packages

The `packages/` directory contains 35 independently versioned npm packages. Each package declares ESM with `"type": "module"`, a public npm access policy, a package README, and an architecture document. Most packages expose their public API from `src/index.js`; the lightweight ORM extensions expose it from `index.js`.

Packages are grouped by responsibility:

- **Foundation:** `core`, `contracts`, `support`, `config`, and `events`
- **Web and data:** `http`, `validation`, `view`, and `database`
- **Platform services:** `auth`, `cache`, `queue`, `mail`, `storage`, `upload`, `media`, `broadcast`, `notifications`, `scheduler`, and `logging`
- **API and AI:** `api`, `search`, and `ai`
- **Developer experience:** `cli`, `console`, `devkit`, `devtools`, `observability`, `testing`, and `skeleton`

For a detailed inventory, see [the package catalog](governance/PACKAGE_CATALOG.md).

## Dependency Direction

Packages should depend inward on foundation contracts and utilities. Application code may depend on packages, but framework packages must not import from `apps/` or `examples/`. The full policy is in [dependency rules](governance/DEPENDENCY_RULES.md).

## Development Commands

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm lint
```

Run a single package's tests from the repository root:

```bash
pnpm --filter @ecfjs/core test
```

## Adding a Package

1. Create `packages/<name>/` with a valid ESM `package.json`.
2. Provide `src/index.js` as the public entry point and export only supported APIs.
3. Add unit tests, `README.md`, and `ARCHITECTURE.md`; ensure the package has valid MIT license metadata.
4. Add repository, license, keywords, Node engine, and publish metadata.
5. Update the package catalog and test the resulting tarball with `pnpm pack --dry-run`.
