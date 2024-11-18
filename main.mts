// @ts-ignore
import * as wasmModule from './node_modules/@aptos-labs/aptos-dynamic-transaction-composer/aptos_dynamic_transaction_composer_bg.wasm';
export * from "./node_modules/@aptos-labs/aptos-dynamic-transaction-composer/aptos_dynamic_transaction_composer.js";
const wasm = new WebAssembly.Module(new Uint8Array(wasmModule.default));
export { wasm };