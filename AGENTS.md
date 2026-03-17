# Script Composer Pack — AI Assistant Notes

This repo is **@aptos-labs/script-composer-pack**: an npm package that generates Move script payload helpers from `@aptos-labs/aptos-dynamic-transaction-composer`.

## Tech Stack

- **Language**: TypeScript
- **Build**: tsup (outputs CJS + ESM)
- **Runtime**: Node.js 18+; package uses WASM (fflate decompression) and Buffer
- **Versioning**: `scripts/bump-version.mjs` — supports major/minor/patch/prerelease and explicit X.Y.Z

## Common Commands

```bash
pnpm install
pnpm build
pnpm run version:bump -- patch   # or minor / major / 1.2.3
```

## Release & Versioning

- Bump version on a new branch: run `pnpm run version:bump -- <major|minor|patch|X.Y.Z>`, then `pnpm build`, commit, push, and open a PR.
- `prepublish` runs `pnpm build` before publish.
- Peer dependencies: `@aptos-labs/aptos-dynamic-transaction-composer`, `@aptos-labs/ts-sdk`.

## When Making Changes

- Entry point is `main.mts`; build output is in `dist/`.
- Change version only via the `version:bump` script to keep `package.json` consistent.
- When touching composer or TS SDK usage, keep peer version ranges in mind.
