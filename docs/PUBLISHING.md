# Publishing ECF Packages

ECF publishes framework modules from `packages/` under the `@ecfjs` npm scope. The root `ecf` package is intentionally private and must not be published.

## Before You Publish

1. Confirm you own or are a maintainer of the `@ecfjs` npm organization.
2. Authenticate with npm using an account authorized for that scope.
3. Decide whether the release is a release candidate or stable version and update every package consistently.
4. Review `CHANGELOG.md`, `SECURITY.md`, and the release acceptance checklist.
5. Run the checks below from a clean working tree.

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm -r --filter "@ecfjs/*" pack --dry-run
```

The pack command is important: it shows the exact contents uploaded to npm without publishing anything.

## Required Package Metadata

Every public package should include these `package.json` fields:

```json
{
  "name": "@ecfjs/example",
  "version": "1.0.0-rc.1",
  "type": "module",
  "main": "./src/index.js",
  "exports": { ".": "./src/index.js" },
  "license": "MIT",
  "repository": { "type": "git", "url": "https://github.com/linkmewaseem/ECF-Elegant-Core-Framework.git" },
  "engines": { "node": ">=22" },
  "publishConfig": { "access": "public" },
  "files": ["src", "README.md", "ARCHITECTURE.md", "LICENSE"]
}
```

`publishConfig.access` is required for first-time publishing of public scoped packages. The `files` allow-list is recommended so tests and other repository-only files are not included in the npm tarball.

## Safe Release Procedure

1. Create a GitHub release tag only after CI succeeds.
2. Publish a single low-dependency package first, then validate installation in a fresh temporary project.
3. Publish packages in dependency order: foundation, web/data, platform services, then developer tooling.
4. Use `pnpm publish --access public` from each package directory, or use a release tool that explicitly selects package directories.
5. Verify package pages, package contents, import paths, and the CLI binary where applicable.

Never run `pnpm publish` from the repository root: it targets the private root manifest, not the individual `@ecfjs/*` packages.

## After Publishing

```bash
npm view @ecfjs/core version
npm view @ecfjs/core dist.tarball
```

Install the released package in a clean test project and run a minimal import before announcing the release.
