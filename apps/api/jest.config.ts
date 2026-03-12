import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  collectCoverageFrom: [
    "**/*.ts",
    "!**/*.spec.ts",
    "!**/*.module.ts",
    "!**/*.controller.ts",
    "!**/*.dto.ts",
    "!**/guards/**",
    "!**/strategies/**",
    "!**/decorators/**",
    "!**/filters/**",
    "!**/seed/**",
    "!**/main.ts",
    "!**/app.controller.ts",
    "!**/app.service.ts",
    "!**/database.service.ts",
    "!**/__mocks__/**",
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  transform: {
    "^.+\\.ts$": [
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
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@masters/database$": "<rootDir>/__mocks__/@masters/database",
  },
};

export default config;
