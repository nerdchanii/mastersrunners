import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

const browserGlobals = {
  ...globals.browser,
  ...globals.es2024,
};

const nodeGlobals = {
  ...globals.node,
  ...globals.es2024,
};

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/out/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "packages/database/generated/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^\\u0000"],
            ["^node:"],
            ["^@masters/", "^@?\\w"],
            ["^@/"],
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            ["^\\./(?=.*/)", "^\\.(?!/?$)", "^\\./?$"],
            ["^.+\\.?(css|scss)$"],
          ],
        },
      ],
    },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    languageOptions: {
      globals: browserGlobals,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: ["apps/api/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"],
    languageOptions: {
      globals: nodeGlobals,
    },
  },
  {
    files: ["apps/api/**/*.spec.ts", "apps/api/**/*.e2e-spec.ts", "apps/api/test/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...nodeGlobals,
      },
    },
  },
  {
    files: ["playwright.config.ts", "apps/web/playwright.config.ts"],
    languageOptions: {
      globals: nodeGlobals,
    },
  },
];
