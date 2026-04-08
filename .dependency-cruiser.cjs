// These rules enforce the repo-level app/package dependency map documented in
// design/architecture/repo-structure.md.
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: "no-web-to-api",
      comment: "The SPA must not reach into API source directly.",
      severity: "error",
      from: {
        path: "^apps/web/",
      },
      to: {
        path: "^apps/api/",
      },
    },
    {
      name: "no-api-to-web",
      comment: "Backend source must not depend on browser app source.",
      severity: "error",
      from: {
        path: "^apps/api/",
      },
      to: {
        path: "^apps/web/",
      },
    },
    {
      name: "no-packages-to-apps",
      comment: "Shared packages stay reusable by not importing app code.",
      severity: "error",
      from: {
        path: "^packages/",
      },
      to: {
        path: "^apps/",
      },
    },
    {
      name: "no-types-to-database",
      comment: "Shared types remain independent from the database package.",
      severity: "error",
      from: {
        path: "^packages/types/",
      },
      to: {
        path: "^packages/database/",
      },
    },
  ],
  options: {
    doNotFollow: {
      path: [
        "node_modules",
        "\\.next",
        "\\/dist\\/",
        "\\/out\\/",
        "\\/storybook-static\\/",
        "\\/storybook-smoke\\/",
        "\\/coverage\\/",
        "packages/database/generated",
      ],
    },
    tsConfig: {
      fileName: "tsconfig.depcruise.json",
    },
    enhancedResolveOptions: {
      extensions: [".ts", ".tsx", ".js", ".mjs", ".json"],
    },
    exclude: {
      path: [
        "\\.(spec|test)\\.ts$",
        "\\.e2e-spec\\.ts$",
        "\\/dist\\/",
        "\\/out\\/",
        "\\/storybook-static\\/",
        "\\/storybook-smoke\\/",
        "\\/coverage\\/",
        "packages/database/generated",
      ],
    },
    tsPreCompilationDeps: true,
  },
};
