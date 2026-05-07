import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { AppProviders } from "@/app/app-providers";
import { createAppQueryClient } from "@/app/query-client";
import { ensureCloudflareAnalytics } from "@/lib/cloudflare-analytics";

import { createAppRouter } from "./router";

import "./globals.css";

ensureCloudflareAnalytics();

const queryClient = createAppQueryClient();
const router = createAppRouter(queryClient);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
