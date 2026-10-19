import { describe, expect, it } from "vitest";
import {
	initSync,
	TransactionComposer,
	wasmModule,
} from "../dist/esm/main.mjs";

describe("script-composer-pack", () => {
	it("exports the pre-bundled wasm module", () => {
		expect(wasmModule).toBeInstanceOf(WebAssembly.Module);
	});

	it("can initialize the composer with the bundled wasm", () => {
		initSync({ module: wasmModule });
		const composer = TransactionComposer.single_signer();
		expect(composer).toBeDefined();
	});
});
