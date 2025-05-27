// @ts-ignore
import * as wasm from './node_modules/@aptos-labs/aptos-dynamic-transaction-composer/aptos_dynamic_transaction_composer_bg.wasm';
export * from "./node_modules/@aptos-labs/aptos-dynamic-transaction-composer/aptos_dynamic_transaction_composer.js";
import { unzlibSync } from "fflate/browser"
import { Buffer } from "buffer"
const wasmModule = new WebAssembly.Module(unzlibSync(Buffer.from(wasm.default, 'base64')));
export { wasmModule };