import { Activity, ArrowUpRight, ShieldCheck } from "lucide-react";
import { createBrowserRouter, Link, Navigate, Outlet } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { RouteErrorBoundary } from "@/pages/error-boundary";
import FeedbackPage from "@/pages/feedback";
import NotFoundPage from "@/pages/not-found";

function RootLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(55,65,81,0.14),_transparent_44%),linear-gradient(180deg,_var(--background),color-mix(in_oklch,var(--background)_94%,white))]">
      <header className="border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div className="space-y-1">
            <Link to="/feedback" className="inline-flex items-center gap-2 text-sm font-semibold">
              <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <ShieldCheck className="size-4" />
              </span>
              Masters Runners Ops
            </Link>
            <p className="text-sm text-muted-foreground">
              Cloudflare Access 뒤에서 운영되는 feedback triage desk
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:inline-flex">
              <Activity className="size-3.5" />
              ops.dev
            </Badge>
            <a
              href="/api-docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent"
            >
              Swagger
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/", element: <Navigate to="/feedback" replace /> },
      { path: "/feedback", element: <FeedbackPage /> },
      { path: "/feedback/:submissionId", element: <FeedbackPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
