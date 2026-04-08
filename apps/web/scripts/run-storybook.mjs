import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import net from "node:net";
import path from "node:path";

const forwardedArgs = process.argv.slice(2);
const sanitizedArgs = forwardedArgs.filter((arg) => arg !== "--");
const storybookHome = path.resolve(process.cwd(), ".storybook-home");
let outputDir = null;

function readRequestedPort(args) {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--port" || arg === "-p") {
      const parsed = Number.parseInt(args[index + 1] ?? "", 10);
      return Number.isNaN(parsed) ? null : parsed;
    }
  }

  return null;
}

function setRequestedPort(args, port) {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--port" || arg === "-p") {
      args[index + 1] = String(port);
      return;
    }
  }

  args.push("--port", String(port));
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (error) => {
      if (error && typeof error === "object" && "code" in error && error.code === "EPERM") {
        resolve(null);
        return;
      }
      resolve(false);
    });
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

async function reserveStorybookPort(args) {
  if (args[0] !== "dev") {
    return;
  }

  const requestedPort = readRequestedPort(args) ?? 6006;

  for (let offset = 0; offset < 20; offset += 1) {
    const candidate = requestedPort + offset;
    // Storybook 10's port fallback prompt can surface `undefined`.
    // Pick an available port up front so local `storybook` remains stable.
    const availability = await isPortAvailable(candidate);

    if (availability === null) {
      console.warn(
        `[storybook] Port probe is unavailable in this environment; falling back to Storybook's native port handling.`,
      );
      return;
    }

    if (availability) {
      setRequestedPort(args, candidate);
      if (candidate !== requestedPort) {
        console.log(`[storybook] Port ${requestedPort} unavailable, using ${candidate} instead.`);
      }
      return;
    }
  }

  throw new Error(`Unable to find an available Storybook port near ${requestedPort}.`);
}

if (sanitizedArgs.includes("--smoke-test")) {
  const smokeArgs = [];

  for (let index = 0; index < sanitizedArgs.length; index += 1) {
    const arg = sanitizedArgs[index];

    if (arg === "--smoke-test" || arg === "--ci") {
      continue;
    }

    if (arg === "--port" || arg === "-p") {
      index += 1;
      continue;
    }

    smokeArgs.push(arg);
  }

  if (smokeArgs[0] === "dev") {
    smokeArgs[0] = "build";
  }

  smokeArgs.push("--output-dir", "storybook-smoke");
  outputDir = "storybook-smoke";
  sanitizedArgs.length = 0;
  sanitizedArgs.push(...smokeArgs);
}

for (let index = 0; index < sanitizedArgs.length; index += 1) {
  const arg = sanitizedArgs[index];
  if (arg === "--output-dir" || arg === "-o") {
    outputDir = sanitizedArgs[index + 1] ?? null;
  }
}

if (sanitizedArgs[0] === "build" && !outputDir) {
  outputDir = "storybook-static";
}

await reserveStorybookPort(sanitizedArgs);

mkdirSync(storybookHome, { recursive: true });

if (outputDir) {
  const resolvedOutputDir = path.resolve(process.cwd(), outputDir);
  rmSync(resolvedOutputDir, { recursive: true, force: true });
  mkdirSync(resolvedOutputDir, { recursive: true });
}

const result = spawnSync("storybook", sanitizedArgs, {
  stdio: "inherit",
  env: {
    ...process.env,
    HOME: storybookHome,
    STORYBOOK_DISABLE_TELEMETRY: "1",
    XDG_CONFIG_HOME: storybookHome,
  },
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
