import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, type User } from "@/lib/auth-context";
import { type Theme, ThemeProvider } from "@/lib/theme-context";

import { createAppQueryClient } from "./query-client";

interface AppProvidersProps {
  children: ReactNode;
  initialTheme?: Theme;
  initialUser?: User | null;
  persistTheme?: boolean;
  queryClient?: QueryClient;
  disableAuthSessionSync?: boolean;
  withToaster?: boolean;
}

export function AppProviders({
  children,
  initialTheme,
  initialUser,
  persistTheme = true,
  queryClient,
  disableAuthSessionSync = false,
  withToaster = true,
}: AppProvidersProps) {
  const [client] = useState(() => queryClient ?? createAppQueryClient());

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider defaultTheme={initialTheme} persist={persistTheme}>
        <AuthProvider initialUser={initialUser} disableSessionSync={disableAuthSessionSync}>
          {children}
          {withToaster ? <Toaster position="top-center" /> : null}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
