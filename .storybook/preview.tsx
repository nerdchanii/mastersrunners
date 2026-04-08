import * as React from "react";
import type { Preview } from "@storybook/react-vite";

import {
  configureStorybookEnvironment,
  type StorybookParameters,
} from "../apps/web/src/storybook/storybook-environment";
import { StorybookProviders } from "../apps/web/src/storybook/storybook-providers";

import "../apps/web/src/globals.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ["Primitives", "Common", "Layout", "Surfaces"],
      },
    },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Preview the visual workbench in light or dark mode.",
      defaultValue: "light",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
    authMode: {
      name: "Auth",
      description: "Preview components as a signed-in runner or a guest.",
      defaultValue: "signed-in",
      toolbar: {
        icon: "user",
        items: [
          { value: "signed-in", title: "Signed in" },
          { value: "guest", title: "Guest" },
        ],
      },
    },
  },
  decorators: [
    (Story, context) =>
      (() => {
        const parameters = context.parameters.storybook as StorybookParameters | undefined;
        configureStorybookEnvironment(context.globals.authMode, parameters);

        return (
          <StorybookProviders
            theme={context.globals.theme}
            authMode={context.globals.authMode}
            initialPath={parameters?.route}
          >
            <Story />
          </StorybookProviders>
        );
      })(),
  ],
};

export default preview;
