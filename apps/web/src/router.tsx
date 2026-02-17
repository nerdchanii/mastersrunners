import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import Header from "@/components/layout/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { LoadingPage } from "@/components/common/LoadingPage";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Auth pages (small, load eagerly)
import LoginPage from "@/pages/login";
import AuthCallbackPage from "@/pages/auth/callback";

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
const NotFoundPage = lazy(() => import("@/pages/not-found"));

/** 인증 가드 - 미인증 시 /login으로 리다이렉트 */
function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  return <Outlet />;
}

function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </ThemeProvider>
  );
}

function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-4 pb-20 md:py-6 md:pb-6">
        <Suspense fallback={<LoadingPage />}>
          <ErrorBoundary>
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
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
    children: [
      // Root redirect
      { path: "/", element: <Navigate to="/feed" replace /> },

      // Auth layout
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
        ],
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
          { path: "/challenges", element: <ChallengesPage /> },
          { path: "/challenges/:id", element: <ChallengeDetailPage /> },
          { path: "/events", element: <EventsPage /> },
          { path: "/events/:id", element: <EventDetailPage /> },
          { path: "/posts/:id", element: <PostDetailPage /> },
          { path: "/profile/:id", element: <UserProfilePage /> },
          { path: "/profile/:id/followers", element: <FollowersPage /> },
          { path: "/profile/:id/following", element: <FollowingPage /> },
          { path: "/search", element: <SearchPage /> },

          // Protected routes (auth required)
          {
            element: <ProtectedRoute />,
            children: [
              { path: "/workouts", element: <WorkoutsPage /> },
              { path: "/workouts/new", element: <NewWorkoutPage /> },
              { path: "/workouts/:id", element: <WorkoutDetailPage /> },
              { path: "/workouts/:id/edit", element: <EditWorkoutPage /> },
              { path: "/challenges/:id/edit", element: <EditChallengePage /> },
              { path: "/events/:id/edit", element: <EditEventPage /> },
              { path: "/posts/new", element: <PostNewPage /> },
              { path: "/posts/:id/edit", element: <EditPostPage /> },
              { path: "/profile", element: <ProfilePage /> },
              { path: "/settings/profile", element: <EditProfilePage /> },
              { path: "/crews/new", element: <CrewNewPage /> },
              { path: "/crews/:id/settings", element: <CrewSettingsPage /> },
              { path: "/challenges/new", element: <ChallengeNewPage /> },
              { path: "/events/new", element: <EventNewPage /> },
              { path: "/messages", element: <MessagesPage /> },
              { path: "/messages/:id", element: <MessageDetailPage /> },
              { path: "/notifications", element: <NotificationsPage /> },
              { path: "/onboarding", element: <OnboardingPage /> },
            ],
          },

          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
