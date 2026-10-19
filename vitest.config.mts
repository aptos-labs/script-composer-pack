import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["tests/**/*.test.mts"],
	},
	resolve: {
		alias: [
			{
				find: /^\.\.\/main\.mts$/,
				replacement: "../dist/esm/main.mjs",
			},
		],
	},
});
