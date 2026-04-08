import path from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../apps/web/src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    const srcPath = path.resolve(configDir, "../apps/web/src");
    const alias = config.resolve?.alias;

    config.plugins = [...(config.plugins ?? []), tailwindcss()];
    config.resolve ??= {};
    config.define = {
      ...config.define,
      "import.meta.env.VITE_API_URL": JSON.stringify(
        process.env.VITE_API_URL ?? "http://localhost:4000/api/v1",
      ),
    };

    if (Array.isArray(alias)) {
      config.resolve.alias = [...alias, { find: "@", replacement: srcPath }];
    } else {
      config.resolve.alias = {
        ...alias,
        "@": srcPath,
      };
    }

    return config;
  },
};

export default config;
