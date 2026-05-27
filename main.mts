// @ts-expect-error
import * as wasm from "./node_modules/@aptos-labs/aptos-dynamic-transaction-composer/aptos_dynamic_transaction_composer_bg.wasm";

export * from "@aptos-labs/aptos-dynamic-transaction-composer";

import { Buffer } from "buffer";
import { unzlibSync } from "fflate/browser";

const wasmModule = new WebAssembly.Module(
	unzlibSync(Buffer.from(wasm.default, "base64")),
);

export { wasmModule };
