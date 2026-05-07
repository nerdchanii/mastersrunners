import { describe, expect, it } from "vitest";

import { challengeInvalidationTargets, challengeKeys } from "./useChallenges";
import { commentInvalidationTargets, commentKeys } from "./useComments";
import { eventInvalidationTargets, eventKeys } from "./useEvents";
import { postKeys } from "./usePosts";
import { profileInvalidationTargets, profileKeys } from "./useProfile";
import { socialInvalidationTargets, socialKeys } from "./useSocial";
import { workoutInvalidationTargets, workoutKeys } from "./useWorkouts";

describe("query key conventions", () => {
  it("keeps event key shape explicit and cursor-independent", () => {
    expect(eventKeys.all).toEqual(["events"]);
    expect(eventKeys.listFamily()).toEqual(["events", "list"]);
    expect(eventKeys.list({ upcoming: "true", limit: "12" })).toEqual([
      "events",
      "list",
      { upcoming: "true", limit: "12" },
    ]);
    expect(eventKeys.infiniteListFamily()).toEqual(["events", "infinite-list"]);
    expect(eventKeys.infiniteList({ tab: "upcoming", limit: 12, cursor: "event-cursor" })).toEqual([
      "events",
      "infinite-list",
      { tab: "upcoming", limit: 12 },
    ]);
    expect(eventKeys.detail("event-1")).toEqual(["events", "detail", "event-1"]);
    expect(eventKeys.myResult("event-1")).toEqual(["events", "detail", "event-1", "my-result"]);
    expect(eventKeys.results("event-1")).toEqual(["events", "detail", "event-1", "results"]);
  });

  it("keeps challenge key shape explicit and cursor-independent", () => {
    expect(challengeKeys.all).toEqual(["challenges"]);
    expect(challengeKeys.listFamily()).toEqual(["challenges", "list"]);
    expect(challengeKeys.list({ type: "distance", limit: "12" })).toEqual([
      "challenges",
      "list",
      { type: "distance", limit: "12" },
    ]);
    expect(challengeKeys.infiniteListFamily()).toEqual(["challenges", "infinite-list"]);
    expect(
      challengeKeys.infiniteList({ joined: true, limit: 12, cursor: "challenge-cursor" }),
    ).toEqual(["challenges", "infinite-list", { joined: true, limit: 12 }]);
    expect(challengeKeys.detail("challenge-1")).toEqual(["challenges", "detail", "challenge-1"]);
    expect(challengeKeys.leaderboard("challenge-1", { limit: 50 })).toEqual([
      "challenges",
      "detail",
      "challenge-1",
      "leaderboard",
      { limit: 50 },
    ]);
  });

  it("keeps comment and social key shape scoped by entity", () => {
    expect(commentKeys.all).toEqual(["comments"]);
    expect(commentKeys.entity("post", "post-1")).toEqual(["comments", "post", "post-1"]);
    expect(commentKeys.listFamily("post", "post-1")).toEqual([
      "comments",
      "post",
      "post-1",
      "list",
    ]);
    expect(commentKeys.list("post", "post-1", { limit: 50 })).toEqual([
      "comments",
      "post",
      "post-1",
      "list",
      { limit: 50 },
    ]);
    expect(commentKeys.detail("workout", "workout-1", "comment-1")).toEqual([
      "comments",
      "workout",
      "workout-1",
      "detail",
      "comment-1",
    ]);

    expect(socialKeys.all).toEqual(["social"]);
    expect(socialKeys.entity("post", "post-1")).toEqual(["social", "post", "post-1"]);
    expect(socialKeys.like("workout", "workout-1")).toEqual([
      "social",
      "workout",
      "workout-1",
      "like",
    ]);
  });

  it("keeps workout and profile key shape tied to fetch-changing params", () => {
    expect(workoutKeys.all).toEqual(["workouts"]);
    expect(workoutKeys.listFamily()).toEqual(["workouts", "list"]);
    expect(workoutKeys.list({ userId: "user-1", visibility: "PUBLIC" })).toEqual([
      "workouts",
      "list",
      { userId: "user-1", visibility: "PUBLIC" },
    ]);
    expect(workoutKeys.feedFamily()).toEqual(["workouts", "feed"]);
    expect(workoutKeys.feed({ limit: 10, excludeLinked: true, cursor: "workout-cursor" })).toEqual([
      "workouts",
      "feed",
      { limit: 10, excludeLinked: true },
    ]);
    expect(workoutKeys.detail("workout-1")).toEqual(["workouts", "detail", "workout-1"]);

    expect(profileKeys.all).toEqual(["profile"]);
    expect(profileKeys.mine()).toEqual(["profile", "mine"]);
    expect(profileKeys.detail("user-1")).toEqual(["profile", "detail", "user-1"]);
    expect(profileKeys.stats("user-1")).toEqual(["profile", "detail", "user-1", "stats"]);
    expect(profileKeys.tabFamily("user-1")).toEqual(["profile", "detail", "user-1", "tab"]);
    expect(profileKeys.tab("user-1", "posts", { limit: 12 })).toEqual([
      "profile",
      "detail",
      "user-1",
      "tab",
      "posts",
      { limit: 12 },
    ]);
  });
});

describe("mutation invalidation conventions", () => {
  it("returns exact event mutation targets without broad root invalidation", () => {
    expect(eventInvalidationTargets.register("event-1")).toEqual([
      eventKeys.detail("event-1"),
      eventKeys.myResult("event-1"),
      eventKeys.listFamily(),
      eventKeys.infiniteListFamily(),
    ]);
    expect(eventInvalidationTargets.cancel("event-1")).toEqual([
      eventKeys.detail("event-1"),
      eventKeys.myResult("event-1"),
      eventKeys.listFamily(),
      eventKeys.infiniteListFamily(),
    ]);
    expect(eventInvalidationTargets.submitResult("event-1")).toEqual([
      eventKeys.detail("event-1"),
      eventKeys.myResult("event-1"),
      eventKeys.results("event-1"),
    ]);
    expect(eventInvalidationTargets.linkWorkout("event-1")).toEqual([
      eventKeys.detail("event-1"),
      eventKeys.myResult("event-1"),
    ]);
  });

  it("returns exact challenge mutation targets without broad root invalidation", () => {
    expect(challengeInvalidationTargets.join("challenge-1")).toEqual([
      challengeKeys.detail("challenge-1"),
      challengeKeys.listFamily(),
      challengeKeys.infiniteListFamily(),
    ]);
    expect(challengeInvalidationTargets.leave("challenge-1")).toEqual([
      challengeKeys.detail("challenge-1"),
      challengeKeys.listFamily(),
      challengeKeys.infiniteListFamily(),
    ]);
    expect(challengeInvalidationTargets.updateProgress("challenge-1", { limit: 50 })).toEqual([
      challengeKeys.detail("challenge-1"),
      challengeKeys.leaderboard("challenge-1", { limit: 50 }),
    ]);
  });

  it("returns exact comment and social mutation targets", () => {
    expect(commentInvalidationTargets.create("post", "post-1")).toEqual([
      commentKeys.list("post", "post-1", { limit: 50 }),
    ]);
    expect(commentInvalidationTargets.delete("workout", "workout-1")).toEqual([
      commentKeys.list("workout", "workout-1", { limit: 50 }),
    ]);
    expect(commentInvalidationTargets.create("post", "post-1", { limit: 25 })).toEqual([
      commentKeys.list("post", "post-1", { limit: 25 }),
    ]);

    expect(
      socialInvalidationTargets.toggleLike({
        entityType: "post",
        entityId: "post-1",
      }),
    ).toEqual([postKeys.detail("post-1"), postKeys.feedFamily()]);
    expect(
      socialInvalidationTargets.toggleLike({
        entityType: "workout",
        entityId: "workout-1",
      }),
    ).toEqual([workoutKeys.detail("workout-1"), workoutKeys.feedFamily()]);
  });

  it("returns exact workout and profile mutation targets", () => {
    expect(workoutInvalidationTargets.updateVisibility("workout-1")).toEqual([
      workoutKeys.detail("workout-1"),
      workoutKeys.listFamily(),
      workoutKeys.feedFamily(),
    ]);
    expect(workoutInvalidationTargets.update("workout-1")).toEqual([
      workoutKeys.detail("workout-1"),
      workoutKeys.listFamily(),
      workoutKeys.feedFamily(),
    ]);

    expect(profileInvalidationTargets.edit("user-1")).toEqual([
      profileKeys.mine(),
      profileKeys.detail("user-1"),
      profileKeys.stats("user-1"),
      profileKeys.tabFamily("user-1"),
    ]);
    expect(profileInvalidationTargets.follow("user-1")).toEqual([
      profileKeys.detail("user-1"),
      profileKeys.stats("user-1"),
      profileKeys.tabFamily("user-1"),
    ]);
  });
});
