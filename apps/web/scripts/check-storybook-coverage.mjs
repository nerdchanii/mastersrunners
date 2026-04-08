import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const componentsRoot = path.resolve("src/components");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

const files = await walk(componentsRoot);
const componentFiles = files.filter(
  (file) => file.endsWith(".tsx") && !file.endsWith(".stories.tsx"),
);

const missing = [];

for (const componentFile of componentFiles) {
  const storyFile = componentFile.replace(/\.tsx$/, ".stories.tsx");
  try {
    const storyStat = await stat(storyFile);
    if (!storyStat.isFile()) {
      missing.push(componentFile);
    }
  } catch {
    missing.push(componentFile);
  }
}

if (missing.length > 0) {
  console.error("Missing co-located Storybook stories:");
  for (const file of missing) {
    console.error(`- ${path.relative(process.cwd(), file)}`);
  }
  process.exit(1);
}

console.log(`Storybook coverage OK: ${componentFiles.length} component files matched.`);
