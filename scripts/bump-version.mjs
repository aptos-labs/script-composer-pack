#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import semver from "semver";

const RELEASE_TYPES = new Set(["major", "minor", "patch", "prerelease"]);

function printUsage() {
  console.log(`Usage:
  node scripts/bump-version.mjs <major|minor|patch|prerelease|X.Y.Z> [options]

Options:
  --file <path>   Target package.json path (default: ./package.json)
  --pre <id>      Prerelease identifier (default: rc)
  --dry-run       Print result without writing file
  -h, --help      Show help

Examples:
  pnpm run version:bump patch
  pnpm run version:bump minor --dry-run
  pnpm run version:bump prerelease --pre beta
  pnpm run version:bump 1.4.0
  pnpm run version:bump patch --file ./packages/foo/package.json`);
}

function parseArgs(argv) {
  const result = {
    action: "",
    file: "package.json",
    preid: "rc",
    dryRun: false,
  };

  const args = [...argv];
  while (args.length > 0) {
    const token = args.shift();
    if (!token) continue;
    if (token === "--") continue;

    if (!result.action && !token.startsWith("-")) {
      result.action = token;
      continue;
    }

    if (token === "--file") {
      const file = args.shift();
      if (!file) throw new Error("Missing value for --file");
      result.file = file;
      continue;
    }

    if (token === "--pre") {
      const preid = args.shift();
      if (!preid) throw new Error("Missing value for --pre");
      result.preid = preid;
      continue;
    }

    if (token === "--dry-run") {
      result.dryRun = true;
      continue;
    }

    if (token === "-h" || token === "--help") {
      printUsage();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${token}`);
  }

  if (!result.action) {
    throw new Error("Missing action. Use major|minor|patch|prerelease|X.Y.Z");
  }

  return result;
}

function nextPrereleaseFromCurrent(currentVersion, preid) {
  const parsed = semver.parse(currentVersion);
  if (!parsed) {
    throw new Error(`Invalid semver: ${currentVersion}`);
  }

  // Keep same base when first entering prerelease mode.
  if (parsed.prerelease.length === 0) {
    return `${parsed.major}.${parsed.minor}.${parsed.patch}-${preid}.0`;
  }

  const next = semver.inc(currentVersion, "prerelease", preid);
  if (!next) {
    throw new Error(`Unable to bump prerelease from ${currentVersion}`);
  }
  return next;
}

function bumpFromAction(currentVersion, action, preid) {
  if (!semver.valid(currentVersion)) {
    throw new Error(`Invalid semver in package.json: ${currentVersion}`);
  }

  const parsedExplicit = semver.parse(action, { loose: false });
  if (parsedExplicit && parsedExplicit.raw === action) {
    return action;
  }

  if (!RELEASE_TYPES.has(action)) {
    if (action.includes(".") || action.includes("-") || action.includes("+")) {
      throw new Error(`Invalid semver: ${action}`);
    }
    throw new Error(`Unsupported action: ${action}`);
  }

  if (action === "prerelease") {
    return nextPrereleaseFromCurrent(currentVersion, preid);
  }

  const next = semver.inc(currentVersion, action);
  if (!next) {
    throw new Error(`Unable to bump ${action} from ${currentVersion}`);
  }
  return next;
}

async function main() {
  try {
    const { action, file, preid, dryRun } = parseArgs(process.argv.slice(2));
    const absPath = path.resolve(process.cwd(), file);
    const raw = await fs.readFile(absPath, "utf8");
    const pkg = JSON.parse(raw);

    if (!pkg.version || typeof pkg.version !== "string") {
      throw new Error(`No valid "version" field in ${absPath}`);
    }

    const current = pkg.version;
    const next = bumpFromAction(current, action, preid);

    if (!semver.valid(next)) {
      throw new Error(`Result is not a valid semver: ${next}`);
    }

    console.log(`Version: ${current} -> ${next}`);

    if (dryRun) {
      console.log("[dry-run] No file changes written.");
      return;
    }

    pkg.version = next;
    await fs.writeFile(absPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
    console.log(`Updated ${absPath}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    printUsage();
    process.exit(1);
  }
}

await main();
