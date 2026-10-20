#!/usr/bin/env node

import fs from "node:fs";

const dist = "dist";
try {
	fs.rmSync(dist, { recursive: true, force: true });
} catch (error) {
	if (error.code !== "ENOENT") throw error;
}
