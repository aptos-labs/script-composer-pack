#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const VERSION_RE = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

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

function parseVersion(version) {
  const match = VERSION_RE.exec(version);
  if (!match) {
    throw new Error(`Invalid semver: ${version}`);
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ?? "",
  };
}

function formatVersion({ major, minor, patch, prerelease }) {
  const base = `${major}.${minor}.${patch}`;
  return prerelease ? `${base}-${prerelease}` : base;
}

function bumpFromAction(currentVersion, action, preid) {
  const next = parseVersion(currentVersion);

  if (VERSION_RE.test(action)) {
    return action;
  }

  switch (action) {
    case "major":
      next.major += 1;
      next.minor = 0;
      next.patch = 0;
      next.prerelease = "";
      return formatVersion(next);
    case "minor":
      next.minor += 1;
      next.patch = 0;
      next.prerelease = "";
      return formatVersion(next);
    case "patch":
      next.patch += 1;
      next.prerelease = "";
      return formatVersion(next);
    case "prerelease": {
      const base = `${next.major}.${next.minor}.${next.patch}`;
      const pre = next.prerelease;
      if (!pre) {
        return `${base}-${preid}.0`;
      }

      const preMatch = /^([0-9A-Za-z-]+)\.(\d+)$/.exec(pre);
      if (!preMatch) {
        return `${base}-${preid}.0`;
      }

      const currentId = preMatch[1];
      const currentNum = Number(preMatch[2]);
      if (currentId !== preid) {
        return `${base}-${preid}.0`;
      }
      return `${base}-${preid}.${currentNum + 1}`;
    }
    default:
      throw new Error(`Unsupported action: ${action}`);
  }
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

    if (!VERSION_RE.test(next)) {
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
