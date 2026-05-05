#!/usr/bin/env node

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const targetDir = path.join(rootDir, "apps/web/src");
const strict = process.argv.includes("--strict");

const bannedPatterns = [
  {
    pattern: "샘플 공개 피드",
    reason: "public social UI should not present itself as sample content",
  },
  {
    pattern: "공개 샘플 게시글",
    reason: "public content labels should not announce placeholder intent",
  },
  {
    pattern: "먼저 둘러보세요",
    reason: "public social surfaces should prefer content-first UI over explainer copy",
  },
];

const textExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
      continue;
    }

    if (textExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function positionFor(content, index) {
  const lines = content.slice(0, index).split("\n");
  return {
    line: lines.length,
    column: lines.at(-1)?.length ?? 0,
  };
}

async function main() {
  const targetStats = await stat(targetDir).catch(() => null);
  if (!targetStats?.isDirectory()) {
    console.error(`Target directory not found: ${targetDir}`);
    process.exit(1);
  }

  const files = await collectFiles(targetDir);
  const findings = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");

    for (const banned of bannedPatterns) {
      let index = content.indexOf(banned.pattern);
      while (index !== -1) {
        const { line, column } = positionFor(content, index);
        findings.push({
          file: path.relative(rootDir, file),
          line,
          column: column + 1,
          pattern: banned.pattern,
          reason: banned.reason,
        });
        index = content.indexOf(banned.pattern, index + banned.pattern.length);
      }
    }
  }

  if (findings.length === 0) {
    console.log("UX copy guard passed: no banned first-wave copy patterns found.");
    return;
  }

  const header = strict
    ? "UX copy guard failed. Found banned first-wave copy patterns:"
    : "UX copy guard warning. Found banned first-wave copy patterns:";
  console.error(header);

  for (const finding of findings) {
    console.error(
      `- ${finding.file}:${finding.line}:${finding.column} -> "${finding.pattern}" (${finding.reason})`,
    );
  }

  process.exit(strict ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
