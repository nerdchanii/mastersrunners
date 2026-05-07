import { type QueryClient, QueryErrorResetBoundary } from "@tanstack/react-query";
import { lazy, type ReactNode, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
  useRevalidator,
  useRouteError,
} from "react-router-dom";

import { BottomNav } from "@/components/common/BottomNav";
import { ErrorBoundary, ErrorFallback } from "@/components/common/ErrorBoundary";
import { FeatureRoute } from "@/components/common/FeatureRoute";
import { LoadingPage } from "@/components/common/LoadingPage";
import { isCrewHubSurfacePath } from "@/components/crew/crew-hub-routes";
import Header from "@/components/layout/Header";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import AuthCallbackPage from "@/pages/auth/callback";
// Auth pages (small, load eagerly)
import LoginPage from "@/pages/login";
import NotFoundPage from "@/pages/not-found";
import { eventDetailLoader } from "@/router-loaders";

// Lazy-loaded pages
const FeedPage = lazy(() => import("@/pages/feed"));
const WorkoutsPage = lazy(() => import("@/pages/workouts"));
const NewWorkoutPage = lazy(() => import("@/pages/workouts/new"));
const WorkoutDetailPage = lazy(() => import("@/pages/workouts/detail"));
const EditWorkoutPage = lazy(() => import("@/pages/workouts/[id]/edit"));
const EditChallengePage = lazy(() => import("@/pages/challenges/[id]/edit/index"));
const EditEventPage = lazy(() => import("@/pages/events/[id]/edit/index"));
const PostNewPage = lazy(() => import("@/pages/posts/new"));
const PostDetailPage = lazy(() => import("@/pages/posts/[id]"));
const EditPostPage = lazy(() => import("@/pages/posts/[id]/edit"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const UserProfilePage = lazy(() => import("@/pages/profile/[id]"));
const ProfileConnectionsPage = lazy(() => import("@/pages/profile/[id]/connections"));
const FollowersPage = lazy(() => import("@/pages/profile/[id]/followers"));
const FollowingPage = lazy(() => import("@/pages/profile/[id]/following"));
const CrewsPage = lazy(() => import("@/pages/crews"));
const CrewNewPage = lazy(() => import("@/pages/crews/new"));
const CrewDetailPage = lazy(() => import("@/pages/crews/[id]"));
const CrewHomePanel = lazy(() =>
  import("@/pages/crews/[id]/CrewHubPanels").then((module) => ({
    default: module.CrewHomePanel,
  })),
);
const CrewActivitiesPanel = lazy(() =>
  import("@/pages/crews/[id]/CrewHubPanels").then((module) => ({
    default: module.CrewActivitiesPanel,
  })),
);
const CrewActivityCreatePanel = lazy(() =>
  import("@/pages/crews/[id]/CrewHubPanels").then((module) => ({
    default: module.CrewActivityCreatePanel,
  })),
);
const CrewBoardPanel = lazy(() =>
  import("@/pages/crews/[id]/CrewHubPanels").then((module) => ({
    default: module.CrewBoardPanel,
  })),
);
const CrewBoardCreatePanel = lazy(() =>
  import("@/pages/crews/[id]/CrewHubPanels").then((module) => ({
    default: module.CrewBoardCreatePanel,
  })),
);
const CrewMembersPanel = lazy(() =>
  import("@/pages/crews/[id]/CrewHubPanels").then((module) => ({
    default: module.CrewMembersPanel,
  })),
);
const CrewManagePanel = lazy(() =>
  import("@/pages/crews/[id]/CrewHubPanels").then((module) => ({
    default: module.CrewManagePanel,
  })),
);
const CrewPendingMembersPanel = lazy(() =>
  import("@/pages/crews/[id]/CrewHubPanels").then((module) => ({
    default: module.CrewPendingMembersPanel,
  })),
);
const CrewSettingsPage = lazy(() => import("@/pages/crews/[id]/settings"));
const CrewActivityDetailPage = lazy(() => import("@/pages/crews/[id]/activities/[activityId]"));
const CrewActivityEditPage = lazy(() => import("@/pages/crews/[id]/activities/[activityId]/edit"));
const QrCheckInPage = lazy(() => import("@/pages/crews/[id]/activities/[activityId]/qr-check-in"));
const ChallengesPage = lazy(() => import("@/pages/challenges"));
const ChallengeNewPage = lazy(() => import("@/pages/challenges/new"));
const ChallengeDetailPage = lazy(() => import("@/pages/challenges/[id]"));
const EventsPage = lazy(() => import("@/pages/events"));
const EventNewPage = lazy(() => import("@/pages/events/new"));
const EventDetailPage = lazy(() => import("@/pages/events/[id]"));
const MessagesPage = lazy(() => import("@/pages/messages"));
const MessageDetailPage = lazy(() => import("@/pages/messages/[id]"));
const CrewMessagePage = lazy(() => import("@/pages/messages/crew/[crewId]"));
const ActivityMessagePage = lazy(
  () => import("@/pages/messages/crew/[crewId]/activity/[activityId]"),
);
const MessagesShell = lazy(() => import("@/pages/messages/shell"));
const EditProfilePage = lazy(() => import("@/pages/settings/profile"));
const NotificationsPage = lazy(() => import("@/pages/notifications"));
const SearchPage = lazy(() => import("@/pages/search"));
const OnboardingPage = lazy(() => import("@/pages/onboarding"));
const FeedbackPage = lazy(() => import("@/pages/feedback"));

/** 인증 가드 - 미인증 시 /login으로 리다이렉트 */
function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const outletContext = useOutletContext<unknown>();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    const nextPath = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?intent=login&next=${encodeURIComponent(nextPath)}`} replace />;
  }

  return <Outlet context={outletContext} />;
}

function RootLayout() {
  return <Outlet />;
}

function toError(error: unknown) {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  return new Error("Route recovery boundary received an unknown error.");
}

export function RootRouteErrorElement() {
  const routeError = toError(useRouteError());
  const location = useLocation();
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();

  const retryRoute = (resetQueryError: () => void) => {
    resetQueryError();
    revalidate();
    void navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true });
  };

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorFallback
          error={routeError}
          onReload={() => window.location.reload()}
          onRetry={() => retryRoute(reset)}
        />
      )}
    </QueryErrorResetBoundary>
  );
}

interface RouteQueryRecoveryBoundaryProps {
  children: ReactNode;
  boundaryKey?: string;
}

export function RouteQueryRecoveryBoundary({
  boundaryKey,
  children,
}: RouteQueryRecoveryBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary key={boundaryKey} onReset={reset}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

function MainLayout() {
  const location = useLocation();
  const isChatRoute = location.pathname.startsWith("/messages");
  const isViewportLockedRoute = location.pathname === "/crews/new";
  const isCrewDetailRoute = isCrewHubSurfacePath(location.pathname);
  const crewHubBoundaryKey = location.pathname.match(/^\/crews\/[^/]+/)?.[0];
  const errorBoundaryKey =
    isCrewDetailRoute && crewHubBoundaryKey ? crewHubBoundaryKey : location.key;
  const isProfileSurfaceRoute =
    location.pathname === "/profile" || /^\/profile\/[^/]+$/.test(location.pathname);

  return (
    <div
      className={cn(
        "bg-background",
        isViewportLockedRoute ? "h-svh overflow-hidden" : "min-h-screen",
      )}
    >
      <Header />
      <main
        className={cn(
          isChatRoute ? "h-svh md:h-[calc(100svh-3.5rem)] md:px-0 md:py-0" : undefined,
          !isChatRoute && !isViewportLockedRoute ? "mx-auto max-w-5xl" : undefined,
          !isChatRoute &&
            (isViewportLockedRoute
              ? "flex h-[calc(100svh-4rem)] w-full max-w-none overflow-hidden px-0 py-0 pb-0 md:h-[calc(100svh-3.5rem)]"
              : isCrewDetailRoute
                ? "px-0 py-0 pb-20 md:pb-0"
                : isProfileSurfaceRoute
                  ? "px-0 py-0 pb-20 md:pb-6"
                  : "px-4 py-4 pb-20 md:py-6 md:pb-6"),
        )}
      >
        <Suspense fallback={<LoadingPage />}>
          <RouteQueryRecoveryBoundary boundaryKey={errorBoundaryKey}>
            <Outlet />
          </RouteQueryRecoveryBoundary>
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}

function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Outlet />
      </div>
    </div>
  );
}

export function createAppRouter(queryClient: QueryClient) {
  return createBrowserRouter([
    {
      element: <RootLayout />,
      errorElement: <RootRouteErrorElement />,
      children: [
        // Root entry
        { path: "/", element: <Navigate to="/feed" replace /> },

        // Auth layout
        {
          element: <AuthLayout />,
          children: [{ path: "/login", element: <LoginPage /> }],
        },

        // Auth callback (no layout)
        { path: "/auth/callback", element: <AuthCallbackPage /> },

        // Main layout (public routes)
        {
          element: <MainLayout />,
          children: [
            { path: "/feed", element: <FeedPage /> },
            { path: "/crews", element: <CrewsPage /> },
            {
              path: "/crews/:id",
              element: <CrewDetailPage />,
              children: [
                { index: true, element: <CrewHomePanel /> },
                { path: "activities", element: <CrewActivitiesPanel /> },
                { path: "board", element: <CrewBoardPanel /> },
                { path: "board/:boardId/posts/:postId", element: <CrewBoardPanel /> },
                { path: "members", element: <CrewMembersPanel /> },
                {
                  element: <ProtectedRoute />,
                  children: [
                    { path: "activities/new", element: <CrewActivityCreatePanel /> },
                    { path: "board/new", element: <CrewBoardCreatePanel /> },
                    { path: "manage", element: <CrewManagePanel /> },
                    { path: "pending", element: <CrewPendingMembersPanel /> },
                  ],
                },
              ],
            },
            {
              path: "/challenges",
              element: (
                <FeatureRoute feature="challenges">
                  <ChallengesPage />
                </FeatureRoute>
              ),
            },
            {
              path: "/challenges/:id",
              element: (
                <FeatureRoute feature="challenges">
                  <ChallengeDetailPage />
                </FeatureRoute>
              ),
            },
            {
              path: "/events",
              element: (
                <FeatureRoute feature="events">
                  <EventsPage />
                </FeatureRoute>
              ),
            },
            {
              path: "/events/:id",
              loader: eventDetailLoader(queryClient),
              element: (
                <FeatureRoute feature="events">
                  <EventDetailPage />
                </FeatureRoute>
              ),
            },
            { path: "/posts/:id", element: <PostDetailPage /> },
            { path: "/profile/:id", element: <UserProfilePage /> },
            { path: "/search", element: <SearchPage /> },

            // Protected routes (auth required)
            {
              element: <ProtectedRoute />,
              children: [
                { path: "/workouts", element: <WorkoutsPage /> },
                { path: "/workouts/new", element: <NewWorkoutPage /> },
                { path: "/workouts/:id", element: <WorkoutDetailPage /> },
                { path: "/workouts/:id/edit", element: <EditWorkoutPage /> },
                {
                  path: "/challenges/:id/edit",
                  element: (
                    <FeatureRoute feature="challenges">
                      <EditChallengePage />
                    </FeatureRoute>
                  ),
                },
                {
                  path: "/events/:id/edit",
                  element: (
                    <FeatureRoute feature="events">
                      <EditEventPage />
                    </FeatureRoute>
                  ),
                },
                { path: "/posts/new", element: <PostNewPage /> },
                { path: "/posts/:id/edit", element: <EditPostPage /> },
                { path: "/profile", element: <ProfilePage /> },
                { path: "/profile/:id/connections", element: <ProfileConnectionsPage /> },
                { path: "/profile/:id/followers", element: <FollowersPage /> },
                { path: "/profile/:id/following", element: <FollowingPage /> },
                { path: "/settings/profile", element: <EditProfilePage /> },
                { path: "/crews/new", element: <CrewNewPage /> },
                { path: "/crews/:id/settings", element: <CrewSettingsPage /> },
                {
                  path: "/crews/:id/activities/:activityId/qr-check-in",
                  element: <QrCheckInPage />,
                },
                {
                  path: "/crews/:id/activities/:activityId/edit",
                  element: <CrewActivityEditPage />,
                },
                { path: "/crews/:id/activities/:activityId", element: <CrewActivityDetailPage /> },
                {
                  path: "/challenges/new",
                  element: (
                    <FeatureRoute feature="challenges">
                      <ChallengeNewPage />
                    </FeatureRoute>
                  ),
                },
                {
                  path: "/events/new",
                  element: (
                    <FeatureRoute feature="events">
                      <EventNewPage />
                    </FeatureRoute>
                  ),
                },
                {
                  path: "/messages",
                  element: <MessagesShell />,
                  children: [
                    { index: true, element: <MessagesPage /> },
                    { path: "crew/:crewId", element: <CrewMessagePage /> },
                    {
                      path: "crew/:crewId/activity/:activityId",
                      element: <ActivityMessagePage />,
                    },
                    { path: ":id", element: <MessageDetailPage /> },
                  ],
                },
                { path: "/notifications", element: <NotificationsPage /> },
                { path: "/feedback", element: <FeedbackPage /> },
                { path: "/onboarding", element: <OnboardingPage /> },
              ],
            },

            { path: "*", element: <NotFoundPage /> },
          ],
        },
      ],
    },
  ]);
}
