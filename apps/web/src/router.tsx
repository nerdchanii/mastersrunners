import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
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
const NotFoundPage = lazy(() => import("@/pages/not-found"));

function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
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

      // Main layout
      {
        element: <MainLayout />,
        children: [
          { path: "/feed", element: <FeedPage /> },
          { path: "/workouts", element: <WorkoutsPage /> },
          { path: "/workouts/new", element: <NewWorkoutPage /> },
          { path: "/workouts/detail", element: <WorkoutDetailPage /> },
          { path: "/posts/new", element: <PostNewPage /> },
          { path: "/posts/:id", element: <PostDetailPage /> },
          { path: "/posts/:id/edit", element: <EditPostPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/profile/:id", element: <UserProfilePage /> },
          { path: "/profile/:id/followers", element: <FollowersPage /> },
          { path: "/profile/:id/following", element: <FollowingPage /> },
          { path: "/settings/profile", element: <EditProfilePage /> },
          { path: "/crews", element: <CrewsPage /> },
          { path: "/crews/new", element: <CrewNewPage /> },
          { path: "/crews/:id", element: <CrewDetailPage /> },
          { path: "/crews/:id/settings", element: <CrewSettingsPage /> },
          { path: "/challenges", element: <ChallengesPage /> },
          { path: "/challenges/new", element: <ChallengeNewPage /> },
          { path: "/challenges/:id", element: <ChallengeDetailPage /> },
          { path: "/events", element: <EventsPage /> },
          { path: "/events/new", element: <EventNewPage /> },
          { path: "/events/:id", element: <EventDetailPage /> },
          { path: "/messages", element: <MessagesPage /> },
          { path: "/messages/:id", element: <MessageDetailPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
