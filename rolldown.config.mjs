import fs from "node:fs";
import path from "node:path";
import { zlibSync } from "fflate";
import { defineConfig } from "rolldown";

function wasmPlugin() {
	return {
		name: "wasm-loader",
		resolveId(source, importer) {
			if (source.endsWith(".wasm") && importer) {
				return path.resolve(path.dirname(importer), source);
			}
		},
		load(id) {
			if (!id.endsWith(".wasm")) return;
			const wasmBuffer = fs.readFileSync(id);
			const compressed = zlibSync(new Uint8Array(wasmBuffer), { level: 9 });
			return `export default "${Buffer.from(compressed).toString("base64")}";`;
		},
	};
}

function removeURLPlugin() {
	return {
		name: "remove-url-code",
		transform(code, id) {
			if (!id.endsWith(".js") && !id.endsWith(".mjs")) return;
			const newCode = code.replace(
				/if \(typeof module_or_path === 'undefined'\) \{\s*module_or_path = new URL\('aptos_dynamic_transaction_composer_bg\.wasm', import\.meta\.url\);\s*\}/g,
				"",
			);
			if (newCode === code) return;
			return { code: newCode };
		},
	};
}

const plugins = [wasmPlugin(), removeURLPlugin()];

export default defineConfig([
	{
		input: "main.mts",
		treeshake: true,
		plugins,
		output: { format: "cjs", dir: "dist/cjs", entryFileNames: "[name].js" },
	},
	{
		input: "main.mts",
		treeshake: true,
		plugins,
		output: { format: "esm", dir: "dist/esm", entryFileNames: "[name].mjs" },
	},
]);
