import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet, useLocation } from "react-router-dom";

import { BottomNav } from "@/components/common/BottomNav";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { FeatureRoute } from "@/components/common/FeatureRoute";
import { LoadingPage } from "@/components/common/LoadingPage";
import Header from "@/components/layout/Header";
import { useAuth } from "@/lib/auth-context";
import AuthCallbackPage from "@/pages/auth/callback";
// Auth pages (small, load eagerly)
import LoginPage from "@/pages/login";
import NotFoundPage from "@/pages/not-found";

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
const FollowersPage = lazy(() => import("@/pages/profile/[id]/followers"));
const FollowingPage = lazy(() => import("@/pages/profile/[id]/following"));
const CrewsPage = lazy(() => import("@/pages/crews"));
const CrewNewPage = lazy(() => import("@/pages/crews/new"));
const CrewDetailPage = lazy(() => import("@/pages/crews/[id]"));
const CrewSettingsPage = lazy(() => import("@/pages/crews/[id]/settings"));
const CrewActivityDetailPage = lazy(() => import("@/pages/crews/[id]/activities/[activityId]"));
const CrewActivityEditPage = lazy(() => import("@/pages/crews/[id]/activities/[activityId]/edit"));
const QrCheckInPage = lazy(() => import("@/pages/crews/[id]/activities/[activityId]/qr-check-in"));
const ActivityChatPage = lazy(() => import("@/pages/crews/[id]/activities/[activityId]/chat"));
const ChallengesPage = lazy(() => import("@/pages/challenges"));
const ChallengeNewPage = lazy(() => import("@/pages/challenges/new"));
const ChallengeDetailPage = lazy(() => import("@/pages/challenges/[id]"));
const EventsPage = lazy(() => import("@/pages/events"));
const EventNewPage = lazy(() => import("@/pages/events/new"));
const EventDetailPage = lazy(() => import("@/pages/events/[id]"));
const MessagesPage = lazy(() => import("@/pages/messages"));
const MessageDetailPage = lazy(() => import("@/pages/messages/[id]"));
const EditProfilePage = lazy(() => import("@/pages/settings/profile"));
const NotificationsPage = lazy(() => import("@/pages/notifications"));
const SearchPage = lazy(() => import("@/pages/search"));
const OnboardingPage = lazy(() => import("@/pages/onboarding"));
const FeedbackPage = lazy(() => import("@/pages/feedback"));

/** 인증 가드 - 미인증 시 /login으로 리다이렉트 */
function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    const nextPath = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?intent=login&next=${encodeURIComponent(nextPath)}`} replace />;
  }

  return <Outlet />;
}

function RootLayout() {
  return <Outlet />;
}

function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-4 pb-20 md:py-6 md:pb-6">
        <Suspense fallback={<LoadingPage />}>
          <ErrorBoundary key={location.key}>
            <Outlet />
          </ErrorBoundary>
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

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: (
      <ErrorBoundary>
        <div />
      </ErrorBoundary>
    ),
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
          { path: "/crews/:id", element: <CrewDetailPage /> },
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
              { path: "/profile/:id/followers", element: <FollowersPage /> },
              { path: "/profile/:id/following", element: <FollowingPage /> },
              { path: "/settings/profile", element: <EditProfilePage /> },
              { path: "/crews/new", element: <CrewNewPage /> },
              { path: "/crews/:id/settings", element: <CrewSettingsPage /> },
              { path: "/crews/:id/activities/:activityId/chat", element: <ActivityChatPage /> },
              { path: "/crews/:id/activities/:activityId/qr-check-in", element: <QrCheckInPage /> },
              { path: "/crews/:id/activities/:activityId/edit", element: <CrewActivityEditPage /> },
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
              { path: "/messages", element: <MessagesPage /> },
              { path: "/messages/:id", element: <MessageDetailPage /> },
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
