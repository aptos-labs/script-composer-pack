# @aptos-labs/script-composer-pack

Generate Move script payload helpers from `@aptos-labs/aptos-dynamic-transaction-composer`.

## Requirements

- Node.js 18+
- pnpm

## Install

```bash
pnpm install
```

## Build

```bash
pnpm build
```

## Version Bump CLI

This repo includes a generic version bump CLI at `scripts/bump-version.mjs`.

### Command

```bash
pnpm run version:bump -- <major|minor|patch|prerelease|X.Y.Z> [options]
```

`X.Y.Z` uses strict SemVer parsing and supports prerelease/build metadata,
for example `1.4.0-rc.1` and `1.4.0+build.7`.

### Options

- `--file <path>`: target `package.json` (default: `./package.json`)
- `--pre <id>`: prerelease id for `prerelease` action (default: `rc`)
- `--dry-run`: preview only, no file changes

### Examples

```bash
# bump patch version
pnpm run version:bump -- patch

# preview minor bump
pnpm run version:bump -- minor --dry-run

# set exact version
pnpm run version:bump -- 1.4.0

# create/increment prerelease
pnpm run version:bump -- prerelease --pre beta

# bump another package.json
pnpm run version:bump -- patch --file ./packages/foo/package.json
```

## Recommended Upgrade Flow

1. Pull latest `main`.
2. Create a new branch for the release.
3. Preview target version:

```bash
pnpm run version:bump -- patch --dry-run
```

4. Apply version bump:

```bash
pnpm run version:bump -- patch
```

5. Verify build:

```bash
pnpm build
```

6. Commit and push:

```bash
git add package.json
git commit -m "chore: bump version to <new-version>"
git push -u origin <your-branch>
```

7. Open PR.
