# Release Readiness Assessment

Assessment date: **2026-08-05**  
Scope: repository publication on GitHub and public npm publication of `@ecfjs/*` packages.

## Verdict

**GitHub publication: ready.** The repository has a clear monorepo structure, MIT license, contribution and security policies, issue and pull-request templates, CI, CodeQL, Dependabot, package-level README files, architecture documents, tests, and examples.

**Public npm publication: configuration-ready.** The codebase passed its current test and type-check suite, package tarball dry-runs succeeded, and each package now declares public access and an explicit tarball allow-list. Before release, an authorized maintainer must still verify ownership of the `@ecfjs` npm scope.

## Verified Evidence

| Check | Result |
| --- | --- |
| Workspace tests (`pnpm test`) | Passed |
| Type check (`pnpm lint`) | Passed |
| Publishable packages discovered | 35 |
| Package README and architecture documents | Present for all 35 |
| Package tarball dry-runs | Passed for all `@ecfjs/*` packages |
| GitHub CI, CodeQL, Dependabot | Configured |

## Release Configuration Status

1. **Completed:** `"publishConfig": { "access": "public" }` is present in every public package.
2. **Completed:** Each package has a `files` allow-list, excluding tests and repository-only files from npm tarballs.
3. **Completed:** Root and CI dry-run commands use `pnpm -r --filter "@ecfjs/*" pack --dry-run`, which validates package tarballs instead of the private root manifest.
4. **Manual prerequisite:** Verify the `@ecfjs` npm scope is owned by the intended publishing account or organization before release.

## Recommended Before Stable v1.0.0

- Make the release workflow publish packages in dependency order using a dedicated changeset or release tool.
- Require CI status checks and CodeQL checks before tagging a release.
- Publish an `rc` release first and validate installation in a fresh Node 22 project.
- Replace any unverified README claims such as “tests passing” badges with CI-backed status badges.

## Documentation Corrections Included

The documentation index now uses portable relative links and no longer references a missing logging guide. This makes the documentation work correctly on GitHub, npm, and local clones.
