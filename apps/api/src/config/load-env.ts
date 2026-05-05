import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { parse } from "dotenv";

const envCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), ".env.local"),
  resolve(process.cwd(), "../../.env"),
  resolve(process.cwd(), "../../../.env"),
  "/app/.env",
];

export const runtimeEnvFilePaths = envCandidates.filter((path) => existsSync(path));

// Match ConfigModule precedence while making env-backed decisions safe at import time.
const parsedEnv = runtimeEnvFilePaths.reduce<Record<string, string>>((acc, envFilePath) => {
  return Object.assign(parse(readFileSync(envFilePath)), acc);
}, {});

for (const [key, value] of Object.entries(parsedEnv)) {
  if (!(key in process.env)) {
    process.env[key] = value;
  }
}
