import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "mjs", "ts"],
  rootDir: "test",
  testRegex: ".*\\.e2e-spec\\.ts$",
  transform: {
    "^.+\\.[tj]s$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", decorators: true },
          transform: { legacyDecorator: true, decoratorMetadata: true },
          target: "es2022",
        },
      },
    ],
  },
  testEnvironment: "node",
  testTimeout: 30000,
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@masters/database$": "<rootDir>/../../../packages/database/src/index.ts",
    "^@prisma/client/runtime/(.+)\\.mjs$": "@prisma/client/runtime/$1.js",
  },
};

export default config;
