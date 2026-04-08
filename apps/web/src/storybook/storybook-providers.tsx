import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

import { AppProviders } from "@/app/app-providers";
import { createAppQueryClient } from "@/app/query-client";
import type { Theme } from "@/lib/theme-context";

import { storybookGuestUser, storybookUser } from "./storybook-fixtures";

interface StorybookProvidersProps {
  authMode: "guest" | "signed-in";
  children: ReactNode;
  initialPath?: string;
  theme: Theme;
}

export function StorybookProviders({
  authMode,
  children,
  initialPath = "/feed",
  theme,
}: StorybookProvidersProps) {
  const queryClient = createAppQueryClient();
  const initialUser = authMode === "signed-in" ? storybookUser : storybookGuestUser;

  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <AppProviders
        key={`${theme}-${authMode}`}
        queryClient={queryClient}
        initialTheme={theme}
        initialUser={initialUser}
        persistTheme={false}
        disableAuthSessionSync
      >
        <div className="min-h-screen bg-background text-foreground">{children}</div>
      </AppProviders>
    </MemoryRouter>
  );
}
