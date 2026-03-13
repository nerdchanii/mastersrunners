#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const [bin, ...args] = process.argv.slice(2);

if (!bin) {
  console.error("Usage: node scripts/run-if-bin.mjs <bin> [...args]");
  process.exit(1);
}

const probeCommand = process.platform === "win32" ? "where" : "which";
const probe = spawnSync(probeCommand, [bin], { stdio: "ignore" });

if (probe.status !== 0) {
  process.exit(0);
}

const result = spawnSync(bin, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
