# WorkoutCard with ShareToggle - Usage Examples

## Basic Usage

### Example 1: Profile Page (Owner's Workouts)

```tsx
import { auth } from "@/auth";
import WorkoutCard from "@/components/workout/WorkoutCard";
import { prisma } from "@masters/database";

export default async function MyWorkoutsPage() {
  const session = await auth();

  const workouts = await prisma.workout.findMany({
    where: { userId: session!.user!.id },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          workout={{
            ...workout,
            userId: workout.userId,
          }}
          currentUserId={session!.user!.id}
          showShareToggle={true}
        />
      ))}
    </div>
  );
}
```

### Example 2: Feed Page (Public Workouts)

```tsx
import WorkoutCard from "@/components/workout/WorkoutCard";
import { prisma } from "@masters/database";

export default async function FeedPage() {
  const workouts = await prisma.workout.findMany({
    where: { isPublic: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          workout={{
            ...workout,
            userId: workout.userId,
          }}
          currentUserId={undefined} // Or session?.user?.id
          showShareToggle={false} // Don't show toggle in feed
        />
      ))}
    </div>
  );
}
```

## API Endpoints

### Toggle Share Status

```typescript
// PATCH /api/workouts/[id]
const response = await fetch(`/api/workouts/${workoutId}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ isPublic: true }), // or false
});
```

### Get Single Workout

```typescript
// GET /api/workouts/[id]
const response = await fetch(`/api/workouts/${workoutId}`);
const workout = await response.json();
```

## Features

1. **Automatic Owner Detection**: ShareToggle only displays for workout owners
2. **Real-time Updates**: Toggle state updates immediately on server
3. **Error Handling**: Displays error messages if toggle fails
4. **Loading States**: Shows "변경 중..." during API call
5. **Accessibility**: Proper ARIA labels for screen readers

## Props

### WorkoutCard Props

- `workout`: Workout data including id, distance, duration, pace, date, memo, isPublic, userId
- `currentUserId` (optional): Current logged-in user's ID
- `showShareToggle` (optional, default: true): Whether to show the toggle

### ShareToggle Props

- `workoutId`: The workout's unique identifier
- `initialIsPublic`: Initial public/private state
