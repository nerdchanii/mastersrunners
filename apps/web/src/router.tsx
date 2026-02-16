import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/layout/Header";

// Auth pages
import LoginPage from "@/pages/login";
import AuthCallbackPage from "@/pages/auth/callback";

// Main pages
import FeedPage from "@/pages/feed";
import WorkoutsPage from "@/pages/workouts";
import NewWorkoutPage from "@/pages/workouts/new";
import WorkoutDetailPage from "@/pages/workouts/detail";
import PostNewPage from "@/pages/posts/new";
import PostDetailPage from "@/pages/posts/[id]";
import EditPostPage from "@/pages/posts/[id]/edit";
import ProfilePage from "@/pages/profile";
import UserProfilePage from "@/pages/profile/[id]";
import CrewsPage from "@/pages/crews";
import CrewNewPage from "@/pages/crews/new";
import CrewDetailPage from "@/pages/crews/[id]";
import CrewSettingsPage from "@/pages/crews/[id]/settings";
import ChallengesPage from "@/pages/challenges";
import ChallengeNewPage from "@/pages/challenges/new";
import ChallengeDetailPage from "@/pages/challenges/[id]";
import EventsPage from "@/pages/events";
import EventNewPage from "@/pages/events/new";
import EventDetailPage from "@/pages/events/[id]";
import MessagesPage from "@/pages/messages";
import MessageDetailPage from "@/pages/messages/[id]";

function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Outlet />
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
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
        ],
      },
    ],
  },
]);
