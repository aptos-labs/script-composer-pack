# @aptos-labs/script-composer-pack

Build batched Aptos Move script payloads using the
[dynamic transaction composer](https://github.com/aptos-labs/aptos-dynamic-transaction-composer)
— with the WASM **pre-bundled and base64-inlined**, so no network fetch or manual asset loading
is required at runtime.

## What this package does

This package bundles the `@aptos-labs/aptos-dynamic-transaction-composer` WebAssembly module
directly into JavaScript, eliminating the need for runtime WASM file loading or manual
initialization. Call `initSync()` once, then use `TransactionComposer` to compose and serialize
batched Move function calls into a script payload.

**This is a low-level, zero-dependency binding.** For a higher-level SDK with transaction
building, signing, and submission, see
[`@aptos-labs/script-composer-sdk`](https://github.com/aptos-labs/script-composer-sdk).

## Compatibility

| Peer dependency | Supported range |
|---|---|
| `@aptos-labs/ts-sdk` | `^3.0.0 \|\| ^4.0.0 \|\| ^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0` |
| `@aptos-labs/aptos-dynamic-transaction-composer` | `^0.1.7` |

Node.js 18+ required.

## Install

```bash
# pnpm
pnpm add @aptos-labs/script-composer-pack \
     @aptos-labs/aptos-dynamic-transaction-composer \
     @aptos-labs/ts-sdk

# npm
npm install @aptos-labs/script-composer-pack \
            @aptos-labs/aptos-dynamic-transaction-composer \
            @aptos-labs/ts-sdk

# yarn
yarn add @aptos-labs/script-composer-pack \
         @aptos-labs/aptos-dynamic-transaction-composer \
         @aptos-labs/ts-sdk
```

Both peer dependencies must be installed by the consumer.

## Usage

```ts
import {
  initSync,
  wasmModule,
  TransactionComposer,
  CallArgument,
} from "@aptos-labs/script-composer-pack";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { BCS } from "@aptos-labs/ts-sdk";

// Initialize the bundled WASM once at startup — no network fetch needed.
initSync({ module: wasmModule });

// Build a batched script that calls two Move functions in sequence.
const composer = TransactionComposer.single_signer();

// First call: withdraw coins from the signer's account.
const amountBcs = BCS.bcsSerializeUint64(100_000_000n);
const [withdrawnCoin] = composer.add_batched_call(
  "0x1::coin",
  "withdraw",
  ["0x1::aptos_coin::AptosCoin"],
  [CallArgument.newSigner(0), CallArgument.newBytes(amountBcs)],
);

// Second call: deposit the returned value from the first call.
const recipientBcs = /* BCS-encoded AccountAddress */ new Uint8Array(32);
composer.add_batched_call(
  "0x1::coin",
  "deposit",
  ["0x1::aptos_coin::AptosCoin"],
  [CallArgument.newBytes(recipientBcs), withdrawnCoin],
);

// Serialize into a Move script payload (Uint8Array).
const scriptPayload = composer.generate_batched_calls(/* with_metadata */ true);

// Hand scriptPayload to @aptos-labs/ts-sdk to build and submit a script transaction.
```

To decompile a serialized script back into its function calls (useful for display or auditing):

```ts
import { generate_batched_call_payload_wasm } from "@aptos-labs/script-composer-pack";

const calls = generate_batched_call_payload_wasm(scriptPayload); // MoveFunctionCall[]
```

## API

| Export | Description |
|---|---|
| `initSync({ module })` | Initialize the bundled WASM module synchronously. Call once before any other API. |
| `wasmModule` | Pre-compiled `WebAssembly.Module` — pass directly to `initSync`. |
| `TransactionComposer` | Core builder. Use `single_signer()` or `multi_signer(n)` to construct, then chain `add_batched_call(...)` calls, and finally `generate_batched_calls(withMetadata)` to serialize. |
| `CallArgument` | Represents a call argument: `newSigner(idx)` for a signer, `newBytes(bytes)` for a BCS-encoded value, or the return value of a previous `add_batched_call`. |
| `MoveFunctionCall` | Represents a single Move function call inside a deserialized script. |
| `PreviousResult` | Internal: a return value from a prior `add_batched_call` that can be forwarded as an argument. |
| `generate_batched_call_payload_wasm(script)` | Decompiles a serialized `Uint8Array` script into `MoveFunctionCall[]`. |

## Development

```bash
pnpm install
pnpm build        # outputs CJS + ESM bundles to dist/

# Preview a version bump without writing
pnpm run version:bump -- patch --dry-run

# Apply a version bump
pnpm run version:bump -- patch   # or minor / major / 1.2.3
```

## Release

Releases are automated via GitHub Actions. After merging a version-bump PR:

```bash
git tag v<version>      # e.g. git tag v0.2.4
git push origin v<version>
```

The [release workflow](.github/workflows/release.yml) verifies the tag matches
`package.json`, checks the version hasn't been published yet, builds, publishes to npm via
OIDC Trusted Publishing, and creates a GitHub Release.

**Prerequisite:** an npm Trusted Publisher must be configured on npmjs.com for this repository
before pushing the first tag.

## License

Apache-2.0 © [Aptos Labs](https://aptoslabs.com)
